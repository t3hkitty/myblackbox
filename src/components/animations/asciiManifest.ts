/**
 * 🐾 MBB / Storyteller AI ASCII Animation Manifest & Engine
 * Portable frame manifest format (frames, timing, trigger event, loop flag)
 * Designed to graduate into Storyteller AI ASCII animation engine.
 * Safe character encoding & pause/off controls.
 */

export interface AsciiFrameManifest {
  id: string;
  name: string;
  description: string;
  triggerEvent: 'idle' | 'task_complete' | 'streak_sync' | 'hydrate_nudge' | 'custom';
  fps: number; // Frames per second or tick interval
  loop: boolean;
  frames: string[];
}

export const BUNNY_ANIMATION_MANIFESTS: Record<string, AsciiFrameManifest> = {
  thirsty_idle: {
    id: 'bunny_thirsty_idle',
    name: 'Thirsty Bunny (Idle & Nudge)',
    description: 'Thirsty pet bunny idle breathing, looking around, and nudging for hydration & tasks',
    triggerEvent: 'idle',
    fps: 1.5,
    loop: true,
    frames: [
      [
        "    (\\(\\       [💧 Needs Water]",
        "    (-.-)  zZ  *thirsty ear twitch*",
        "   o_(\")(\")    ~ hydrate or complete task ~"
      ].join('\n'),
      [
        "    (\\(\\       [💧 Needs Water]",
        "    (o.o)  ?   *sniffs for water*",
        "   o_(\")(\")    ~ tap quick log for sip ~"
      ].join('\n'),
      [
        "    (\\ /)      [🌿 Thirsty Pet Nudge]",
        "    ( 'x' )    *soft bunny nose wiggle*",
        "   c(\")(\")     ~ checking #blackbox ~"
      ].join('\n'),
      [
        "    (\\(\\       [💧 Needs Water]",
        "    (u_u)  ... *waiting patiently*",
        "   o_(\")(\")    ~ one task at a time ~"
      ].join('\n')
    ]
  },
  task_complete: {
    id: 'bunny_task_complete',
    name: 'Bunny Task Complete Hop',
    description: 'Pet bunny happy jump and celebratory wiggle upon task completion',
    triggerEvent: 'task_complete',
    fps: 3,
    loop: false,
    frames: [
      [
        "      (\\(\\     ✨ TASK DONE! ✨",
        "     ( ^.^)    *ears perk up*",
        "    o_(\")(\")   +10 XP gained"
      ].join('\n'),
      [
        "     /)/)      🌟 HOP! 🌟",
        "    ( ^o^) /   *celebratory bunny hop*",
        "     (\")(\")o   dopamine delivered!"
      ].join('\n'),
      [
        "      (\\(\\     🎉 NICE WORK! 🎉",
        "     ( >.<)    *happy foot thump*",
        "    c(\")(\")    streak maintained"
      ].join('\n'),
      [
        "      (\\(\\     🌸 RECHARGED 🌸",
        "     ( ^.^)    ~ ready for next task ~",
        "    o_(\")(\")   backlog -1"
      ].join('\n')
    ]
  },
  streak_sync: {
    id: 'bunny_streak_sync',
    name: 'Bunny Sync & Streak Celebration',
    description: 'Bunny celebration with sparkling carrots when gtasks or routines sync',
    triggerEvent: 'streak_sync',
    fps: 2.5,
    loop: false,
    frames: [
      [
        "    (\\(\\       ⚡ 2-WAY SYNC OK! ⚡",
        "    ( @.@)     [ Google Tasks <-> MBB ]",
        "   o_(\")(\")    *data flowing cleanly*"
      ].join('\n'),
      [
        "    (\\(\\       🥕 YUM! SYNCED! 🥕",
        "    ( ^-^) >*  *munching sync carrot*",
        "   c(\")(\")     Tasker deep link active"
      ].join('\n'),
      [
        "     \\ \\       💫 IN HARMONY 💫",
        "    ( ^3^)~♥   *happy tail bounce*",
        "   o_(\")(\")    0 sync conflicts"
      ].join('\n')
    ]
  }
};
