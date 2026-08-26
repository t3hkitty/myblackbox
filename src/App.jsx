import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import Navbar from './components/Navbar';
import QuickLogBar from './components/QuickLogBar';
import MoodTrackerModal from './components/MoodTrackerModal';
import SipTrackerWidget from './components/SipTrackerWidget';
import TroubleshootingPanel from './components/TroubleshootingPanel';
import EbookTracker from './components/EbookTracker';
import TaskBlackboxWidget from './components/TaskBlackboxWidget';
import DataImportHub from './components/DataImportHub';
import LogTimeline from './components/LogTimeline';
import SettingsModal from './components/SettingsModal';
import GoalsTrackerWidget from './components/GoalsTrackerWidget';
import JournalGeneratorModal from './components/JournalGeneratorModal';
import LiveMicroTweetBar from './components/LiveMicroTweetBar';
import CompatibilityHubModal from './components/CompatibilityHubModal';
import GoogleKeepWidget from './components/GoogleKeepWidget';
import BestPracticesWidget from './components/BestPracticesWidget';
import FAQModal from './components/FAQModal';
import PhotoSceneParserModal from './components/PhotoSceneParserModal';
import WeatherLoggerWidget from './components/WeatherLoggerWidget';
import TagTallyWidget from './components/TagTallyWidget';
import AttractionPanelWidget from './components/AttractionPanelWidget';
import SpotifySkipWidget from './components/SpotifySkipWidget';
import ConsumedMediaLibraryModal from './components/ConsumedMediaLibraryModal';
import GooglePhotosWidget from './components/GooglePhotosWidget';
import LayoutCustomizerModal from './components/LayoutCustomizerModal';
import PluginMarketplaceModal from './components/PluginMarketplaceModal';
import BloggerExportModal from './components/BloggerExportModal';
import BraindumpWatcherWidget from './components/BraindumpWatcherWidget';
import SelfCompassionC4EngineWidget from './components/SelfCompassionC4EngineWidget';
import AddictionMonitorWidget from './components/AddictionMonitorWidget';
import HealthTelemetryWidget from './components/HealthTelemetryWidget';
import CalendarSanitizerWidget from './components/CalendarSanitizerWidget';
import UpcomingEventsWidget from './components/UpcomingEventsWidget';
import MovementFitnessWidget from './components/MovementFitnessWidget';
import HyperboleMonitorWidget from './components/HyperboleMonitorWidget';
import ContactsHubWidget from './components/ContactsHubWidget';
import OnThisDayPanelWidget from './components/OnThisDayPanelWidget';
import AcademicSchoolHubWidget from './components/AcademicSchoolHubWidget';
import CreatorStudioWidget from './components/CreatorStudioWidget';
import AccountsDirectoryWidget from './components/AccountsDirectoryWidget';
import DocumentImporterModal from './components/DocumentImporterModal';
import { DynamicAtmosphericBackground } from '@lorik/shared-kawaii-ui';
import { dispatchIftttEvent } from './services/iftttService';
import { dispatchCustomWebhook } from './services/customWebhookService';
import { DualPaneWorkspace } from '@lorik/shared-kawaii-ui';
import { captureOAuthTokenFromUrlHash, startAutoPollingGoogleTasks, saveAccessToken, connectGoogleAccount, logSyncDiagnostic } from './services/googleDriveAuthEngine';
import { setupLinkInterceptor } from './plugins/mbbLinkInterceptor';

import {
  getLogs,
  saveLog,
  deleteLog,
  deleteMultipleLogs,
  deleteAllSampleLogs,
  bulkUpdateLogs,
  toggleArchiveLog,
  getMoodSets,
  saveMoodSet,
  deleteMoodSet,
  getActiveMoodSetId,
  setActiveMoodSetId,
  getSipSettings,
  saveSipSettings,
  getStoredGoals,
  saveGoal,
  getAutoTagConfig
} from './services/blackboxStorage';

import { DEFAULT_GOALS } from './services/goalsEngine';

import { createMicrologZettel } from './services/zettelEngine';

import BlackboxLitanyPulseModal from './components/BlackboxLitanyPulseModal';

export default function App() {
  const [logs, setLogs] = useState([]);
  const [moodSets, setMoodSets] = useState([]);
  const [activeMoodSetId, setActiveMoodSetIdState] = useState('standard_5');
  const [sipSettings, setSipSettingsState] = useState({});
  const [goals, setGoals] = useState([]);

  // Modals
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState('mood_sets');
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isInteropOpen, setIsInteropOpen] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isConsumedMediaOpen, setIsConsumedMediaOpen] = useState(false);
  const [isLayoutCustomizerOpen, setIsLayoutCustomizerOpen] = useState(false);
  const [isPluginsOpen, setIsPluginsOpen] = useState(false);
  const [isBloggerOpen, setIsBloggerOpen] = useState(false);
  const [isBlackboxLitanyOpen, setIsBlackboxLitanyOpen] = useState(false);
  const [isDocImporterOpen, setIsDocImporterOpen] = useState(false);
  const [activeTagTallyFilter, setActiveTagTallyFilter] = useState(null);
  const [populatedLiveTweetMedia, setPopulatedLiveTweetMedia] = useState(null);

  // Workspace Mode State ('all' | 'school' | 'work' | 'accounts' | 'personal')
  const [activeMode, setActiveMode] = useState('all');

  // Panel Customization & Sticky Tape Pinned Panels
  const [panelVisibility, setPanelVisibility] = useState({
    accounts: true,
    hyperbole_monitor: true,
    movement_fitness: true,
    calendar_sanitizer: true,
    c4_engine: true,
    braindump: true,
    sips: true,
    tasks: true,
    tbr: true,
    google_photos: true,
    live_tweets: true,
    spotify: true,
    attraction: true,
    goals: true,
    troubleshooting: true,
    weather: true,
    best_practices: true,
    telemetry_import: true,
    contacts: true,
    on_this_day: true,
    academic_hub: true,
    creator_studio: true
  });

  const handleSelectMode = (modeKey) => {
    setActiveMode(modeKey);
    if (modeKey === 'school') {
      setPanelVisibility({
        academic_hub: true,
        tasks: true,
        calendar_sanitizer: true,
        upcoming_events: true,
        sips: true,
        health_telemetry: true,
        weather: true,
        best_practices: true,
        hyperbole_monitor: false,
        creator_studio: false,
        live_tweets: false,
        spotify: false,
        accounts: false,
        attraction: false,
        goals: false,
        troubleshooting: false,
        telemetry_import: false,
        contacts: true,
        on_this_day: true,
        c4_engine: false,
        braindump: false,
        google_photos: false
      });
    } else if (modeKey === 'work') {
      setPanelVisibility({
        creator_studio: true,
        tasks: true,
        live_tweets: true,
        contacts: true,
        accounts: true,
        google_photos: true,
        telemetry_import: true,
        academic_hub: false,
        hyperbole_monitor: false,
        movement_fitness: false,
        calendar_sanitizer: false,
        c4_engine: false,
        braindump: false,
        sips: false,
        addiction_monitor: false,
        spotify: false,
        attraction: false,
        goals: false,
        troubleshooting: true,
        weather: false,
        best_practices: true,
        on_this_day: false
      });
    } else if (modeKey === 'accounts') {
      setPanelVisibility({
        accounts: true,
        contacts: true,
        telemetry_import: true,
        troubleshooting: true,
        google_photos: false,
        academic_hub: false,
        creator_studio: false,
        hyperbole_monitor: false,
        movement_fitness: false,
        calendar_sanitizer: false,
        c4_engine: false,
        braindump: false,
        sips: false,
        tasks: false,
        tbr: false,
        live_tweets: false,
        spotify: false,
        attraction: false,
        goals: false,
        weather: false,
        best_practices: false,
        on_this_day: false
      });
    } else {
      // All Modes / Master
      handleResetLayout();
    }
  };

  const [showContactsModal, setShowContactsModal] = useState(false);
  const [pinnedPanels, setPinnedPanels] = useState({});

  const handleTogglePanelVisibility = (panelId) => {
    setPanelVisibility(prev => ({
      ...prev,
      [panelId]: !prev[panelId]
    }));
  };

  const THEME_SET_KEY = 'blackbox_theme_style_set_v1';
  const [activeC4Scene, setActiveC4Scene] = useState('all');
  const [themeStyleSet, setThemeStyleSetState] = useState(() => {
    return localStorage.getItem(THEME_SET_KEY) || 'classic';
  });

  const handleSelectThemeStyleSet = (newTheme) => {
    setThemeStyleSetState(newTheme);
    localStorage.setItem(THEME_SET_KEY, newTheme);
  };

  const handleTogglePinPanel = (panelId) => {
    setPinnedPanels(prev => ({
      ...prev,
      [panelId]: !prev[panelId]
    }));
  };

  const handleResetLayout = () => {
    setActiveMode('all');
    setPanelVisibility({
      accounts: true,
      hyperbole_monitor: true,
      movement_fitness: true,
      calendar_sanitizer: true,
      c4_engine: true,
      braindump: true,
      sips: true,
      tasks: true,
      tbr: true,
      google_photos: true,
      live_tweets: true,
      spotify: true,
      attraction: true,
      goals: true,
      troubleshooting: true,
      weather: true,
      best_practices: true,
      telemetry_import: true,
      contacts: true,
      on_this_day: true,
      academic_hub: true,
      creator_studio: true
    });
  };

  const mbbActionHandlerRef = React.useRef(null);
  mbbActionHandlerRef.current = (payload) => {
    const { action, params } = payload;
    if (action === 'switch-vault' || action === 'vault' || action === 'switch') {
      const vaultMode = params.vault || params.mode;
      if (vaultMode && ['all', 'school', 'work', 'accounts', 'personal'].includes(vaultMode)) {
        handleSelectMode(vaultMode);
      }
    } else if (action === 'sip') {
      const amount = parseInt(params.amount || '1', 10);
      const level = params.level || 'water';
      handleLogSip(amount, { id: level, label: level.charAt(0).toUpperCase() + level.slice(1), emoji: '💧' });
    } else if (action === 'pee') {
      handleLogPee();
    } else if (action === 'poo') {
      handleLogPoo();
    }
  };

  useEffect(() => {
    // Capture OAuth access token if returning from Google redirect
    captureOAuthTokenFromUrlHash();

    // Listen for OAuth token posted from child auth popup window
    const handleOAuthMessage = (event) => {
      if (event.data && event.data.type === 'GOOGLE_OAUTH_SUCCESS' && event.data.token) {
        saveAccessToken(event.data.token);
        connectGoogleAccount('user@gmail.com', event.data.token);
        logSyncDiagnostic('OAUTH_POPUP_MESSAGE_RECEIVED', 'Received OAuth access token from auth popup window!', 'SUCCESS');
      }
    };
    window.addEventListener('message', handleOAuthMessage);

    // Initialize Anymd Link Interceptor
    const cleanupInterceptor = setupLinkInterceptor();
    window.mbbPluginBundle = {
      handleAction: (payload) => {
        if (mbbActionHandlerRef.current) {
          mbbActionHandlerRef.current(payload);
        }
      }
    };

    // Load stored state
    setLogs(getLogs());
    const loadedSets = getMoodSets();
    setMoodSets(loadedSets);
    const activeId = getActiveMoodSetId();
    setActiveMoodSetIdState(activeId);
    setSipSettingsState(getSipSettings());
    const loadedGoals = getStoredGoals() || DEFAULT_GOALS;
    setGoals(loadedGoals);

    // Start 60-second automatic background polling for Google Tasks REST API
    const stopPolling = startAutoPollingGoogleTasks((tasks, listName) => {
      tasks.forEach(task => {
        const titleText = task.title;
        if (!titleText) return;
        const currentLogs = getLogs();
        const exists = currentLogs.some(l => l.title === titleText || l.title === `Google Task: ${titleText}`);
        if (!exists) {
          saveLog({
            id: `gtask_${task.id || Date.now()}`,
            zettelId: `${Date.now()}`,
            title: `Google Task: ${titleText}`,
            type: 'task',
            content: `**Google Tasks Auto-Ingest (${listName})**:\n${task.notes || 'Discovered during 60s auto-poll cycle.'}`,
            tags: ['#google_tasks', `#${listName}`, '#task', '#telemetry'],
            createdPT: `${Date.now()}`
          });
          setLogs(getLogs());
        }
      });
    }, 60000);

    return () => {
      stopPolling();
      window.removeEventListener('message', handleOAuthMessage);
      cleanupInterceptor();
      delete window.mbbPluginBundle;
    };
  }, []);

  const activeMoodSet = moodSets.find(m => m.id === activeMoodSetId) || moodSets[0];

  const handleAddGoal = (newGoal) => {
    const updated = saveGoal(newGoal);
    setGoals(updated);
  };

  const handleIncrementGoal = (goalId) => {
    const updated = goals.map(g => {
      if (g.id === goalId) {
        return { ...g, currentCount: (g.currentCount || 0) + 1 };
      }
      return g;
    });
    setGoals(updated);
    saveGoals(updated);
  };

  const handleUpdateGoal = (goalId, patch) => {
    const updated = goals.map(g => {
      if (g.id === goalId) {
        return { ...g, ...patch };
      }
      return g;
    });
    setGoals(updated);
    saveGoals(updated);
  };

  const handleSaveZettel = (newLogData) => {
    // Auto-Tagging System for all Created & Imported Logs
    const atConfig = getAutoTagConfig();
    if (atConfig && atConfig.enabled && atConfig.tag) {
      const formattedTag = atConfig.tag.startsWith('#') ? atConfig.tag : `#${atConfig.tag}`;
      const existingTags = newLogData.tags || [];
      if (!existingTags.includes(formattedTag)) {
        newLogData.tags = [...existingTags, formattedTag];
      }
    }

    const entry = createMicrologZettel(newLogData);
    const updated = saveLog(entry);
    setLogs(updated);

    // Auto-sync bio pairs (poop and pee) to Hydration & Excretion Station counters!
    if (newLogData?.metadata?.bioType === 'poop' || newLogData?.tags?.includes('#poo')) {
      const updatedPooCount = (sipSettings.todayPooCount || 0) + 1;
      const newSettings = { ...sipSettings, todayPooCount: updatedPooCount };
      setSipSettingsState(newSettings);
      saveSipSettings(newSettings);
    } else if (newLogData?.metadata?.bioType === 'pee' || newLogData?.tags?.includes('#pee')) {
      const updatedPeeCount = (sipSettings.todayPeeCount || 0) + 1;
      const newSettings = { ...sipSettings, todayPeeCount: updatedPeeCount };
      setSipSettingsState(newSettings);
      saveSipSettings(newSettings);
    }

    if (updated.length > 0) {
      dispatchIftttEvent(updated[0]);
      dispatchCustomWebhook(updated[0]);
    }
  };

  const handleDeleteLog = (logId) => {
    const updated = deleteLog(logId);
    setLogs(updated);
  };

  const handleMassDeleteLogs = (logIds) => {
    const updated = deleteMultipleLogs(logIds);
    setLogs(updated);
  };

  const handleBulkUpdateLogs = (logIds, options) => {
    const updated = bulkUpdateLogs(logIds, options);
    setLogs(updated);
  };

  const handleToggleArchiveLog = (logId) => {
    const updated = toggleArchiveLog(logId);
    setLogs(updated);
  };

  const handleSelectMoodSet = (setId) => {
    setActiveMoodSetIdState(setId);
    setActiveMoodSetId(setId);
  };

  const renderPanelComponent = (panelId) => {
    switch (panelId) {
      case 'hyperbole_monitor':
        return (
          <HyperboleMonitorWidget
            key="hyperbole_monitor"
            onSaveZettel={handleSaveZettel}
            isPinned={pinnedPanels.hyperbole_monitor}
            onTogglePin={() => handleTogglePinPanel('hyperbole_monitor')}
          />
        );
      case 'movement_fitness':
        return (
          <MovementFitnessWidget
            key="movement_fitness"
            allLogs={logs}
            onSaveZettel={handleSaveZettel}
            isPinned={pinnedPanels.movement_fitness}
            onTogglePin={() => handleTogglePinPanel('movement_fitness')}
          />
        );
      case 'calendar_sanitizer':
        return (
          <CalendarSanitizerWidget
            key="calendar_sanitizer"
            onSaveZettel={handleSaveZettel}
            isPinned={pinnedPanels.calendar_sanitizer}
            onTogglePin={() => handleTogglePinPanel('calendar_sanitizer')}
          />
        );
      case 'upcoming_events':
        return (
          <UpcomingEventsWidget
            key="upcoming_events"
            allLogs={logs}
            onSaveZettel={handleSaveZettel}
            isPinned={pinnedPanels.upcoming_events}
            onTogglePin={() => handleTogglePinPanel('upcoming_events')}
          />
        );
      case 'on_this_day':
        return (
          <OnThisDayPanelWidget
            key="on_this_day"
            allLogs={logs}
            onSaveZettel={handleSaveZettel}
            onToggleZettelExclusion={(log) => {
              const hasExclusion = (log.tags || []).some(t => ['#no_on_this_day', '#exclude_on_this_day', '#no_otd', 'no_on_this_day'].includes(t.toLowerCase()));
              if (hasExclusion) {
                handleBulkUpdateLogs([log.id], { removeTag: '#no_on_this_day' });
              } else {
                handleBulkUpdateLogs([log.id], { addTag: '#no_on_this_day' });
              }
            }}
            isPinned={pinnedPanels.on_this_day}
            onTogglePin={() => handleTogglePinPanel('on_this_day')}
          />
        );
      case 'c4_engine':
        return (
          <SelfCompassionC4EngineWidget
            key="c4_engine"
            onSaveZettel={handleSaveZettel}
            isPinned={pinnedPanels.c4_engine}
            onTogglePin={() => handleTogglePinPanel('c4_engine')}
          />
        );
      case 'braindump':
        return (
          <BraindumpWatcherWidget
            key="braindump"
            allLogs={logs}
            onSaveZettel={handleSaveZettel}
            isPinned={pinnedPanels.braindump}
            onTogglePin={() => handleTogglePinPanel('braindump')}
          />
        );
      case 'google_photos':
        return (
          <GooglePhotosWidget
            key="google_photos"
            isPinned={pinnedPanels.google_photos}
            onTogglePin={() => handleTogglePinPanel('google_photos')}
          />
        );
      case 'tasks':
        return (
          <TaskBlackboxWidget
            key="tasks"
            onSaveTaskLog={handleSaveZettel}
            onConnectGoogle={() => setIsSettingsOpen(true)}
            isPinned={pinnedPanels.tasks}
            onTogglePin={() => handleTogglePinPanel('tasks')}
          />
        );
      case 'goals':
        return (
          <GoalsTrackerWidget
            key="goals"
            goals={goals}
            allLogs={logs}
            onSaveZettel={handleSaveZettel}
            onAddGoal={handleAddGoal}
            onIncrementGoal={handleIncrementGoal}
            onUpdateGoal={handleUpdateGoal}
            isPinned={pinnedPanels.goals}
            onTogglePin={() => handleTogglePinPanel('goals')}
          />
        );
      case 'addiction_monitor':
        return (
          <AddictionMonitorWidget
            key="addiction_monitor"
            allLogs={logs}
            sipSettings={sipSettings}
            onLogSip={handleLogSip}
            onSaveZettel={handleSaveZettel}
            isPinned={pinnedPanels.addiction_monitor}
            onTogglePin={() => handleTogglePinPanel('addiction_monitor')}
          />
        );
      case 'health_telemetry':
        return (
          <HealthTelemetryWidget
            key="health_telemetry"
            allLogs={logs}
            sipSettings={sipSettings}
            onLogSip={handleLogSip}
            onLogPee={handleLogPee}
            onLogPoo={handleLogPoo}
            onSaveZettel={handleSaveZettel}
            isPinned={pinnedPanels.health_telemetry}
            onTogglePin={() => handleTogglePinPanel('health_telemetry')}
          />
        );
      case 'live_tweets':
        return (
          <LiveMicroTweetBar
            key="live_tweets"
            allLogs={logs}
            onSaveTweet={handleSaveZettel}
            onPostMicroTweet={handleSaveZettel}
            isPinned={pinnedPanels.live_tweets}
            onTogglePin={() => handleTogglePinPanel('live_tweets')}
          />
        );
      case 'contacts':
        return (
          <ContactsHubWidget
            key="contacts"
            allLogs={logs}
            onFilterByContact={(tag) => setActiveTagTallyFilter(tag)}
            onSaveContactZettel={(zettelData) => handleSaveZettel(zettelData)}
          />
        );
      case 'academic_hub':
        return (
          <AcademicSchoolHubWidget
            key="academic_hub"
            allLogs={logs}
            onSaveZettel={handleSaveZettel}
            isPinned={pinnedPanels.academic_hub}
            onTogglePin={() => handleTogglePinPanel('academic_hub')}
          />
        );
      case 'creator_studio':
        return (
          <CreatorStudioWidget
            key="creator_studio"
            allLogs={logs}
            onSaveZettel={handleSaveZettel}
            isPinned={pinnedPanels.creator_studio}
            onTogglePin={() => handleTogglePinPanel('creator_studio')}
          />
        );
      case 'accounts':
        return (
          <AccountsDirectoryWidget
            key="accounts"
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenGeminiSettings={() => {
              setSettingsInitialTab('gemini_ai');
              setIsSettingsOpen(true);
            }}
            onSaveZettel={handleSaveZettel}
          />
        );
      default:
        return null;
    }
  };

  const handleSaveMoodSet = (newSet) => {
    const updated = saveMoodSet(newSet);
    setMoodSets(updated);
  };

  const handleDeleteMoodSet = (setId) => {
    const updated = deleteMoodSet(setId);
    setMoodSets(updated);
    if (activeMoodSetId === setId && updated.length > 0) {
      handleSelectMoodSet(updated[0].id);
    }
  };

  const handleLogSip = (count, beverage) => {
    const updatedSipCount = (sipSettings.todaySipCount || 0) + count;
    const newSettings = {
      ...sipSettings,
      todaySipCount: updatedSipCount
    };
    setSipSettingsState(newSettings);
    saveSipSettings(newSettings);

    const bevLabel = beverage ? beverage.label : 'Water';
    const bevEmoji = beverage ? beverage.emoji : '💧';
    const bevId = beverage ? beverage.id : 'water';

    // Save as Zettel telemetry event
    handleSaveZettel({
      title: `${bevEmoji} Hydration Log: +${count} Sip(s) of ${bevLabel}`,
      type: 'sip',
      content: `Recorded ${count} sips of ${bevLabel} (${bevEmoji}) (~${count * (sipSettings.sipVolumeMl || 15)} ${sipSettings.unit || 'ml'}). Daily total: ${updatedSipCount} sips.`,
      tags: ['#sip', `#${bevId}`, '#telemetry', '#hydration'],
      metadata: { sipsAdded: count, newTotal: updatedSipCount, beverage: bevLabel }
    });
  };

  const handleLogPee = () => {
    const updatedPeeCount = (sipSettings.todayPeeCount || 0) + 1;
    const newSettings = {
      ...sipSettings,
      todayPeeCount: updatedPeeCount
    };
    setSipSettingsState(newSettings);
    saveSipSettings(newSettings);

    const sipCount = newSettings.todaySipCount || 0;
    const ratio = (sipCount / updatedPeeCount).toFixed(1);

    handleSaveZettel({
      title: `Pee Excretion: +1 Log (Total ${updatedPeeCount} 🚽)`,
      type: 'microlog',
      content: `Recorded pee excretion event. Daily total: ${updatedPeeCount} pees (${ratio} sips/pee ratio).`,
      tags: ['#pee', '#hydration', '#excretion', '#telemetry']
    });
  };

  const handleLogPoo = () => {
    const updatedPooCount = (sipSettings.todayPooCount || 0) + 1;
    const newSettings = {
      ...sipSettings,
      todayPooCount: updatedPooCount
    };
    setSipSettingsState(newSettings);
    saveSipSettings(newSettings);

    handleSaveZettel({
      title: `Poo Excretion: +1 Log (Total ${updatedPooCount} 💩)`,
      type: 'microlog',
      content: `Recorded bowel excretion event. Daily total: ${updatedPooCount} poos.`,
      tags: ['#poo', '#bio_event', '#excretion', '#telemetry']
    });
  };

  const handleSaveSipSettings = (newSettings) => {
    setSipSettingsState(newSettings);
    saveSipSettings(newSettings);
  };

  const hasAnyPinned = Object.values(pinnedPanels).some(v => Boolean(v));

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      <DynamicAtmosphericBackground activeC4Scene={activeC4Scene} themeStyleSet={themeStyleSet} />
      
      {/* Top Navbar */}
      <Navbar
        moodSets={moodSets}
        activeMoodSetId={activeMoodSetId}
        onSelectMoodSet={handleSelectMoodSet}
        themeStyleSet={themeStyleSet}
        onSelectThemeStyleSet={handleSelectThemeStyleSet}
        activeMode={activeMode}
        onSelectMode={handleSelectMode}
        onOpenSettings={() => {
          setSettingsInitialTab('mood_sets');
          setIsSettingsOpen(true);
        }}
        onOpenGeminiSettings={() => {
          setSettingsInitialTab('gemini_ai');
          setIsSettingsOpen(true);
        }}
        onOpenToolMatrix={() => setIsInteropOpen(true)}
        onOpenInteropModal={() => setIsInteropOpen(true)}
        onOpenFAQ={() => setIsFAQOpen(true)}
        onOpenConsumedMedia={() => setIsConsumedMediaOpen(true)}
        onOpenLayoutCustomizer={() => setIsLayoutCustomizerOpen(true)}
        onOpenPlugins={() => setIsPluginsOpen(true)}
        onOpenBlogger={() => setIsBloggerOpen(true)}
        onOpenContacts={() => setShowContactsModal(true)}
        onOpenAccounts={() => handleSelectMode('accounts')}
        onOpenLitanyModal={() => setIsBlackboxLitanyOpen(true)}
        onOpenDocumentImporter={() => setIsDocImporterOpen(true)}
        allLogs={logs}
      />

      {/* Low-Friction Microlog Quick Trigger Bar */}
      <QuickLogBar
        onLogSip={handleLogSip}
        onLogPee={handleLogPee}
        onLogPoo={handleLogPoo}
        onOpenMoodModal={() => setIsMoodModalOpen(true)}
        onQuickTagLog={handleSaveZettel}
        onOpenEbookModal={() => {
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
        onOpenTaskModal={() => {
          window.scrollTo({ top: 700, behavior: 'smooth' });
        }}
        onOpenJournalModal={() => setIsJournalModalOpen(true)}
        onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
        activeC4Scene={activeC4Scene}
        onSelectC4Scene={setActiveC4Scene}
      />

      {/* Google Calendar Agenda Mode / Day View Bar */}
      <div className="glass-panel" style={{ margin: '0 1rem 1.25rem 1rem', padding: '0.8rem 1rem', background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={18} color="#60a5fa" />
            <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff' }}>
              📅 Today's Agenda (GCal Day View Timeline)
            </span>
            <span style={{ fontSize: '0.72rem', color: '#93c5fd', background: 'rgba(59, 130, 246, 0.15)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
              {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Live GCal Agenda Sync & Time Slot Tracking
          </span>
        </div>

        {/* Horizontal GCal Agenda Timeline Chips */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.3rem' }}>
          <div className="glass-card" style={{ padding: '0.45rem 0.7rem', minWidth: '130px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: '700' }}>8:00 AM PT</div>
            <div style={{ fontSize: '0.78rem', color: '#fff', fontWeight: '700' }}>💊 Morning Meds</div>
            <div style={{ fontSize: '0.65rem', color: '#a7f3d0' }}>✓ Confirmed</div>
          </div>

          <div className="glass-card" style={{ padding: '0.45rem 0.7rem', minWidth: '130px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: '700' }}>9:30 AM PT</div>
            <div style={{ fontSize: '0.78rem', color: '#fff', fontWeight: '700' }}>🍳 Breakfast</div>
            <div style={{ fontSize: '0.65rem', color: '#a7f3d0' }}>✓ Confirmed</div>
          </div>

          <div className="glass-card" style={{ padding: '0.45rem 0.7rem', minWidth: '140px', background: 'rgba(245, 158, 11, 0.18)', border: '1px solid rgba(245, 158, 11, 0.5)', borderRadius: '6px', boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)' }}>
            <div style={{ fontSize: '0.68rem', color: '#fcd34d', fontWeight: '800' }}>11:30 AM PT (Next)</div>
            <div style={{ fontSize: '0.78rem', color: '#fff', fontWeight: '700' }}>🍱 Lunch & Hydration</div>
            <div style={{ fontSize: '0.65rem', color: '#fef08a' }}>⏰ TTS Alert In 5m</div>
          </div>

          <div className="glass-card" style={{ padding: '0.45rem 0.7rem', minWidth: '150px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.68rem', color: '#60a5fa', fontWeight: '700' }}>1:00 PM PT</div>
            <div style={{ fontSize: '0.78rem', color: '#fff', fontWeight: '700' }}>💻 Blackbox Deep Work</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Creation Pair Engine</div>
          </div>

          <div className="glass-card" style={{ padding: '0.45rem 0.7rem', minWidth: '140px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.68rem', color: '#c084fc', fontWeight: '700' }}>5:30 PM PT</div>
            <div style={{ fontSize: '0.78rem', color: '#fff', fontWeight: '700' }}>🏃 Evening Meds & Stretch</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Google Fit Sync</div>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <main style={{ padding: '0 1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        <DualPaneWorkspace 
          leftTitle="Dashboard & Tasks"
          leftIcon={<span style={{ fontSize: '1.2rem' }}>⚡</span>}
          rightTitle="Trackers & Feeds"
          rightIcon={<span style={{ fontSize: '1.2rem' }}>📡</span>}
          leftContent={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {panelVisibility.best_practices && (
            <BestPracticesWidget
              onOpenSettings={() => setIsSettingsOpen(true)}
              onStartBlackboxTask={(title) => {
                handleSaveZettel({
                  title: `Started Task: ${title}`,
                  type: 'task',
                  content: `Started task from #roundtoit backlog`,
                  tags: ['#blackbox_task', '#roundtoit', '#workflow']
                });
              }}
            />
          )}

          {panelVisibility.hyperbole_monitor && !pinnedPanels.hyperbole_monitor && (
            renderPanelComponent('hyperbole_monitor')
          )}

          {panelVisibility.movement_fitness && !pinnedPanels.movement_fitness && (
            renderPanelComponent('movement_fitness')
          )}

          {panelVisibility.calendar_sanitizer && !pinnedPanels.calendar_sanitizer && (
            renderPanelComponent('calendar_sanitizer')
          )}

          {panelVisibility.upcoming_events && !pinnedPanels.upcoming_events && (
            renderPanelComponent('upcoming_events')
          )}

          {panelVisibility.accounts && !pinnedPanels.accounts && (
            renderPanelComponent('accounts')
          )}

          {panelVisibility.academic_hub && !pinnedPanels.academic_hub && (
            renderPanelComponent('academic_hub')
          )}

          {panelVisibility.creator_studio && !pinnedPanels.creator_studio && (
            renderPanelComponent('creator_studio')
          )}

          {panelVisibility.on_this_day && !pinnedPanels.on_this_day && (
            renderPanelComponent('on_this_day')
          )}

          {panelVisibility.c4_engine && !pinnedPanels.c4_engine && (
            renderPanelComponent('c4_engine')
          )}

          {panelVisibility.braindump && !pinnedPanels.braindump && (
            renderPanelComponent('braindump')
          )}

          {panelVisibility.troubleshooting && (
            <TroubleshootingPanel
              allLogs={logs}
              onQuickTagLog={handleSaveZettel}
            />
          )}

          {panelVisibility.google_photos && !pinnedPanels.google_photos && (
            renderPanelComponent('google_photos')
          )}

          {panelVisibility.weather && (
            <WeatherLoggerWidget
              onLogWeatherZettel={handleSaveZettel}
            />
          )}

          {panelVisibility.contacts && !pinnedPanels.contacts && (
            renderPanelComponent('contacts')
          )}

          {panelVisibility.attraction && (
            <AttractionPanelWidget
              allLogs={logs}
              goals={goals}
              onLogAttractionZettel={handleSaveZettel}
            />
          )}

          {panelVisibility.spotify && (
            <SpotifySkipWidget
              onLogSpotifyZettel={handleSaveZettel}
            />
          )}

          {panelVisibility.goals && !pinnedPanels.goals && (
            renderPanelComponent('goals')
          )}

          {panelVisibility.sips && (
            <SipTrackerWidget
              sipSettings={sipSettings}
              onLogSip={handleLogSip}
              onLogPee={handleLogPee}
              onLogPoo={handleLogPoo}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onSaveSipSettings={handleSaveSipSettings}
            />
          )}

          {panelVisibility.addiction_monitor && !pinnedPanels.addiction_monitor && (
            renderPanelComponent('addiction_monitor')
          )}

          {renderPanelComponent('health_telemetry')}

          {panelVisibility.tasks && !pinnedPanels.tasks && (
            renderPanelComponent('tasks')
          )}

          {panelVisibility.telemetry_import && (
            <DataImportHub
              onImportLogs={handleSaveZettel}
            />
          )}

        </div>
          }
          rightContent={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {panelVisibility.live_tweets && !pinnedPanels.live_tweets && (
            renderPanelComponent('live_tweets')
          )}

          <GoogleKeepWidget
            onConvertToZettel={handleSaveZettel}
          />

          <EbookTracker
            allLogs={logs}
            activeMoodSet={activeMoodSet}
            onSaveBookReviewZettel={handleSaveZettel}
          />

          <TagTallyWidget
            allLogs={logs}
            onSelectTagFilter={(tag) => setActiveTagTallyFilter(tag)}
          />

          <LogTimeline
            logs={logs}
            onDeleteLog={handleDeleteLog}
            onMassDeleteLogs={handleMassDeleteLogs}
            onBulkUpdateLogs={handleBulkUpdateLogs}
            onToggleArchiveLog={handleToggleArchiveLog}
            onDeleteAllSampleLogs={() => {
              const updated = deleteAllSampleLogs();
              setLogs(updated);
            }}
            externalTagFilter={activeTagTallyFilter}
          />

        </div>
          }
        />
      </main>

      {/* Modals */}
      <LayoutCustomizerModal
        isOpen={isLayoutCustomizerOpen}
        onClose={() => setIsLayoutCustomizerOpen(false)}
        panelVisibility={panelVisibility}
        onTogglePanelVisibility={handleTogglePanelVisibility}
        pinnedPanels={pinnedPanels}
        onTogglePinPanel={handleTogglePinPanel}
        onResetLayout={handleResetLayout}
      />

      <PluginMarketplaceModal
        isOpen={isPluginsOpen}
        onClose={() => setIsPluginsOpen(false)}
        onOpenBloggerExport={() => setIsBloggerOpen(true)}
      />

      <BloggerExportModal
        isOpen={isBloggerOpen}
        onClose={() => setIsBloggerOpen(false)}
        allLogs={logs}
      />

      {/* Modals */}
      <CompatibilityHubModal
        isOpen={isInteropOpen}
        onClose={() => setIsInteropOpen(false)}
        allLogs={logs}
      />

      <FAQModal
        isOpen={isFAQOpen}
        onClose={() => setIsFAQOpen(false)}
        onQuickTagLog={handleSaveZettel}
      />

      <PhotoSceneParserModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onSaveZettel={handleSaveZettel}
      />

      <ConsumedMediaLibraryModal
        isOpen={isConsumedMediaOpen}
        onClose={() => setIsConsumedMediaOpen(false)}
        allLogs={logs}
      />

      <JournalGeneratorModal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        allLogs={logs}
        sipSettings={sipSettings}
        onSaveJournalZettel={handleSaveZettel}
      />

      <MoodTrackerModal
        isOpen={isMoodModalOpen}
        onClose={() => setIsMoodModalOpen(false)}
        activeMoodSet={activeMoodSet}
        allLogs={logs}
        onSaveMoodLog={handleSaveZettel}
        onOpenMoodSetManager={() => {
          setIsMoodModalOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        moodSets={moodSets}
        activeMoodSetId={activeMoodSetId}
        onSelectMoodSet={handleSelectMoodSet}
        onSaveMoodSet={handleSaveMoodSet}
        onDeleteMoodSet={handleDeleteMoodSet}
        sipSettings={sipSettings}
        onSaveSipSettings={handleSaveSipSettings}
        initialTab={settingsInitialTab}
      />

      {showContactsModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#111827', border: '1px solid #3b82f6', borderRadius: '12px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '1.25rem', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#60a5fa' }}>
                👥 Contacts Hub & Contact-to-Markdown Converter
              </h2>
              <button
                onClick={() => setShowContactsModal(false)}
                className="btn-secondary"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', color: '#fca5a5' }}
              >
                ✕ Close
              </button>
            </div>

            <ContactsHubWidget
              allLogs={logs}
              onFilterByContact={(tag) => {
                setShowContactsModal(false);
                setActiveTagTallyFilter(tag);
              }}
              onSaveContactZettel={(zettelData) => handleSaveZettel(zettelData)}
            />
          </div>
        </div>
      )}

      {/* Blackbox, Running Litany & Watchdog Pulse Modal */}
      <BlackboxLitanyPulseModal
        isOpen={isBlackboxLitanyOpen}
        onClose={() => setIsBlackboxLitanyOpen(false)}
        allLogs={logs}
        onEmitPulse={(pulseZettel) => {
          handleSaveZettel(pulseZettel);
          setIsBlackboxLitanyOpen(false);
        }}
      />

      {/* Document Importer: Academic Syllabus & Post-Procedure Aftercare Routines */}
      <DocumentImporterModal
        isOpen={isDocImporterOpen}
        onClose={() => setIsDocImporterOpen(false)}
        onImportTasks={(tasks) => {
          tasks.forEach(t => {
            handleSaveZettel({
              title: t.title,
              type: 'task',
              content: t.details || t.title,
              tags: t.tags || ['#task', '#syllabus', '#school_mode']
            });
          });
        }}
        onSaveRoutine={(routineSchedule) => {
          handleSaveZettel({
            title: `🩹 Aftercare Recovery Routine: ${routineSchedule.procedureName}`,
            type: 'aftercare_routine',
            content: `**Morning Routine:**\n${routineSchedule.morningRoutine.join('\n')}\n\n**Afternoon Routine:**\n${routineSchedule.afternoonRoutine.join('\n')}\n\n**Evening Routine:**\n${routineSchedule.eveningRoutine.join('\n')}\n\n**Night Routine:**\n${routineSchedule.nightRoutine.join('\n')}`,
            tags: ['#aftercare', '#recovery', '#health_routine', '#routine']
          });
        }}
      />


    </div>
  );
}
