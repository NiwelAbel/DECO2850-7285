export const TUTORIAL_STEPS = [
  {
    page: "home",
    selector: '[data-tutorial="bear-card"]',
    title: "Check BaoBei's status",
    text: "This card shows whether the bear is connected and whether a new moment is waiting. Tap it anytime to open Live Activity.",
  },
  {
    page: "home",
    selector: '[data-tutorial="voice-card"]',
    title: "Open voice messages",
    text: "A badge appears when your child leaves a new message. Open this card to listen and reply.",
  },
  {
    page: "messages",
    selector: '[data-tutorial="record-reply"]',
    title: "Record a reply",
    text: "Press here to record your voice. You can listen to it before sending it to your child's bear.",
  },
  {
    page: "live",
    selector: '[data-tutorial="response-actions"]',
    title: "Send a warm response",
    text: "Choose a heart-light, light or warm hug. These controls will connect to the physical bear in the hardware version.",
  },
  {
    page: "live",
    selector: '[data-tutorial="activity-list"]',
    title: "Review recent activity",
    text: "Your newest action appears at the top. Scroll inside this box to see earlier activity without moving the controls.",
  },
  {
    page: "profile",
    selector: '[data-tutorial="help-support"]',
    title: "Find help whenever you need it",
    text: "Open Help & Support to replay this tutorial or review the introduction later.",
  },
];

export function getTutorialStep(index) {
  const safeIndex = Math.min(Math.max(index, 0), TUTORIAL_STEPS.length - 1);
  return TUTORIAL_STEPS[safeIndex];
}
