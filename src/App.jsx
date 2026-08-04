import React, { useState, useEffect } from 'react';
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
import { dispatchIftttEvent } from './services/iftttService';

import {
  getLogs,
  saveLog,
  deleteLog,
  deleteMultipleLogs,
  deleteAllSampleLogs,
  bulkUpdateLogs,
  getMoodSets,
  saveMoodSet,
  getActiveMoodSetId,
  setActiveMoodSetId,
  getSipSettings,
  saveSipSettings,
  getStoredGoals,
  saveGoal
} from './services/blackboxStorage';

import { DEFAULT_GOALS } from './services/goalsEngine';

import { createMicrologZettel } from './services/zettelEngine';

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
  const [activeTagTallyFilter, setActiveTagTallyFilter] = useState(null);

  useEffect(() => {
    // Load stored state
    setLogs(getLogs());
    const loadedSets = getMoodSets();
    setMoodSets(loadedSets);
    const activeId = getActiveMoodSetId();
    setActiveMoodSetIdState(activeId);
    setSipSettingsState(getSipSettings());
    const loadedGoals = getStoredGoals() || DEFAULT_GOALS;
    setGoals(loadedGoals);
  }, []);

  const activeMoodSet = moodSets.find(m => m.id === activeMoodSetId) || moodSets[0];

  const handleAddGoal = (newGoal) => {
    const updated = saveGoal(newGoal);
    setGoals(updated);
  };

  const handleSaveZettel = (newLogData) => {
    const entry = createMicrologZettel(newLogData);
    const updated = saveLog(entry);
    setLogs(updated);
    if (updated.length > 0) {
      dispatchIftttEvent(updated[0]);
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

  const handleSelectMoodSet = (setId) => {
    setActiveMoodSetIdState(setId);
    setActiveMoodSetId(setId);
  };

  const handleSaveMoodSet = (newSet) => {
    const updated = saveMoodSet(newSet);
    setMoodSets(updated);
  };

  const handleLogSip = (count) => {
    const updatedSipCount = (sipSettings.todaySipCount || 0) + count;
    const newSettings = {
      ...sipSettings,
      todaySipCount: updatedSipCount
    };
    setSipSettingsState(newSettings);
    saveSipSettings(newSettings);

    // Save as Zettel telemetry event
    handleSaveZettel({
      title: `Hydration Sips: +${count} Sip(s)`,
      type: 'sip',
      content: `Recorded ${count} sips (~${count * (sipSettings.sipVolumeMl || 15)} ${sipSettings.unit || 'ml'}). Daily total: ${updatedSipCount} sips.`,
      tags: ['#sip', '#water', '#telemetry'],
      metadata: { sipsAdded: count, newTotal: updatedSipCount }
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

  const handleSaveSipSettings = (newSettings) => {
    setSipSettingsState(newSettings);
    saveSipSettings(newSettings);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Top Navbar */}
      <Navbar
        moodSets={moodSets}
        activeMoodSetId={activeMoodSetId}
        onSelectMoodSet={handleSelectMoodSet}
        onOpenSettings={() => {
          setSettingsInitialTab('mood_sets');
          setIsSettingsOpen(true);
        }}
        onOpenGeminiSettings={() => {
          setSettingsInitialTab('gemini_ai');
          setIsSettingsOpen(true);
        }}
        onOpenToolMatrix={() => setIsInteropOpen(true)}
        onOpenFAQ={() => setIsFAQOpen(true)}
        allLogs={logs}
      />

      {/* Low-Friction Microlog Quick Trigger Bar */}
      <QuickLogBar
        onLogSip={handleLogSip}
        onLogPee={handleLogPee}
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
      />

      {/* Main Responsive Grid Layout */}
      <main style={{ padding: '0 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
        
        {/* Left Column: Best Practices, Diagnostics, Goals, Sips, Tasks & Connections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
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

          <TroubleshootingPanel
            allLogs={logs}
            onQuickTagLog={handleSaveZettel}
          />

          <WeatherLoggerWidget
            onLogWeatherZettel={handleSaveZettel}
          />

          <GoalsTrackerWidget
            goals={goals}
            allLogs={logs}
            sipSettings={sipSettings}
            onQuickTagLog={handleSaveZettel}
            onAddGoal={handleAddGoal}
          />

          <SipTrackerWidget
            sipSettings={sipSettings}
            onLogSip={handleLogSip}
            onLogPee={handleLogPee}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          <TaskBlackboxWidget
            onSaveTaskLog={handleSaveZettel}
          />

          <DataImportHub
            onImportLogs={handleSaveZettel}
          />

        </div>

        {/* Right Column: Micro-Tweets, Keep Widget, Ebook Sessions & Zettel Journal Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <LiveMicroTweetBar
            activeBookTitle={null}
            onPostMicroTweet={handleSaveZettel}
            onStartBlackboxTask={(title) => {
              handleSaveZettel({
                title: `Started Session: ${title}`,
                type: 'task',
                content: `Started live media session for ${title}`,
                tags: ['#blackbox_task', '#media_session', '#telemetry']
              });
            }}
          />

          <GoogleKeepWidget
            onConvertToZettel={handleSaveZettel}
          />

          <EbookTracker
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
            onDeleteAllSampleLogs={() => {
              const updated = deleteAllSampleLogs();
              setLogs(updated);
            }}
            externalTagFilter={activeTagTallyFilter}
          />

        </div>

      </main>

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

    </div>
  );
}
