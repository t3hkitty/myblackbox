/**
 * 🐾 MBB Extension Bundle Entry Point
 * Implements AnyMDExtensionBundle: registers Vault Storage, UI Mount slots,
 * event routing, and clean activation/deactivation hooks.
 */

import React from 'react';
import manifest from './extensionManifest.json';
import {
  AnyMDExtensionBundle,
  AnyMDExtensionContext,
  IntentEvent
} from './host/AnyMDExtensionHostTypes';
import { TelemeowtricsAdapter } from './telemeowtrics';
import { MBBQuickBarWidget } from './ui/MBBQuickBarWidget';
import { MBBTaskBoardModal } from './ui/MBBTaskBoardModal';
import { StageDirectorSettingsPanel } from './ui/StageDirectorSettingsPanel';
import { mbbEngineStore } from './mbbEngine';

export class MBBExtensionBundle implements AnyMDExtensionBundle {
  public manifest = manifest;
  private cleanups: Array<() => void> = [];
  private telemeowtrics?: TelemeowtricsAdapter;
  private isModalOpen = false;
  private modalStateListeners: Set<(open: boolean) => void> = new Set();

  public setModalOpen(open: boolean) {
    this.isModalOpen = open;
    this.modalStateListeners.forEach((cb) => cb(open));
  }

  public activate(context: AnyMDExtensionContext): void {
    console.log('[MBBExtensionBundle] Activating MBB bundle in AnyMD...');
    this.telemeowtrics = new TelemeowtricsAdapter(context.storage);

    // 1. Register Intent & Protocol Routers
    const unregisterMbb = context.router.registerProtocol('mbb', (event: IntentEvent) => {
      this.telemeowtrics?.handleIntent(event);
    });
    this.cleanups.push(unregisterMbb);

    const unregisterKittlibr = context.router.registerProtocol('kittlibr', (event: IntentEvent) => {
      this.telemeowtrics?.handleIntent(event);
    });
    this.cleanups.push(unregisterKittlibr);

    const unregisterFirehose = context.router.registerBroadcast(
      'org.anymd.broadcast.UNIFIED_FIREHOSE',
      (event: IntentEvent) => {
        this.telemeowtrics?.handleIntent(event);
      }
    );
    this.cleanups.push(unregisterFirehose);

    const unregisterTasker = context.router.registerBroadcast(
      'org.anymd.broadcast.TASKER_WEBHOOK',
      (event: IntentEvent) => {
        this.telemeowtrics?.handleIntent(event);
      }
    );
    this.cleanups.push(unregisterTasker);

    // 2. Register UI Mount Slots
    // Slot A: 1-Click Right-Side QuickBar
    const bundleInstance = this;
    const QuickBarMountWrapper: React.FC = () => {
      return <MBBQuickBarWidget onOpenModal={() => bundleInstance.setModalOpen(true)} />;
    };

    const unregisterQuickBar = context.registerUIMount({
      slot: 'quickbar',
      id: `${context.extensionId}:quickbar`,
      title: 'MBB Flight Deck QuickBar',
      component: QuickBarMountWrapper,
      order: 10
    });
    this.cleanups.push(unregisterQuickBar);

    // Slot B: TaskBoard Modal
    const TaskBoardModalWrapper: React.FC = () => {
      const [isOpen, setIsOpen] = React.useState(bundleInstance.isModalOpen);
      React.useEffect(() => {
        const listener = (open: boolean) => setIsOpen(open);
        bundleInstance.modalStateListeners.add(listener);
        return () => {
          bundleInstance.modalStateListeners.delete(listener);
        };
      }, []);

      return <MBBTaskBoardModal isOpen={isOpen} onClose={() => bundleInstance.setModalOpen(false)} />;
    };

    const unregisterModal = context.registerUIMount({
      slot: 'taskboard-modal',
      id: `${context.extensionId}:modal`,
      title: 'MBB Task Board & Flight Deck Modal',
      component: TaskBoardModalWrapper,
      order: 10
    });
    this.cleanups.push(unregisterModal);

    // Slot C: Settings Panel (Stage Director Configuration)
    const unregisterSettings = context.registerUIMount({
      slot: 'settings-panel',
      id: `${context.extensionId}:settings`,
      title: 'Stage Director Settings',
      component: StageDirectorSettingsPanel,
      order: 20
    });
    this.cleanups.push(unregisterSettings);

    // Expose bundle globally for CLI / external bridge access
    if (typeof window !== 'undefined') {
      (window as any).mbbExtensionBundle = this;
      (window as any).mbbEngineStore = mbbEngineStore;
    }
  }

  public deactivate(): void {
    console.log('[MBBExtensionBundle] Deactivating MBB bundle...');
    this.cleanups.forEach((cleanup) => {
      try {
        cleanup();
      } catch (err) {
        console.warn('Cleanup error during deactivation:', err);
      }
    });
    this.cleanups = [];

    if (typeof window !== 'undefined') {
      delete (window as any).mbbExtensionBundle;
    }
  }
}

export const mbbExtensionBundle = new MBBExtensionBundle();

// Auto-register with AnyMDExtensionHost
import { anyMDExtensionHost } from './host/AnyMDExtensionHost';
anyMDExtensionHost.registerBundle(mbbExtensionBundle);

export * from './types';
export * from './roman';
export * from './emojiFolders';
export * from './stageDirector';
export * from './mbbEngine';
export * from './mbbSyncAdapter';
export * from './telemeowtrics';
export * from './host/AnyMDExtensionHost';
export * from './host/AnyMDExtensionHostTypes';
export * from './ui/MBBQuickBarWidget';
export * from './ui/MBBTaskBoardModal';
export * from './ui/StageDirectorSettingsPanel';
