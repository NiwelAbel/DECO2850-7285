export const ONBOARDING_KEY = "baobeiOnboardingComplete";

const BEAR_PRESENTATIONS = {
  calm: {
    state: "calm",
    label: "Your child is with BaoBei",
    detail: "Connected and ready",
  },
  happy: {
    state: "happy",
    label: "A warm moment shared",
    detail: "BaoBei is feeling cheerful",
  },
  message: {
    state: "message",
    label: "A new moment is waiting",
    detail: "Your voice reply was sent to BaoBei",
  },
  glowing: {
    state: "glowing",
    label: "Your response is glowing",
    detail: "The light was sent to BaoBei",
  },
  listening: {
    state: "listening",
    label: "Playing a voice message",
    detail: "BaoBei is listening with you",
  },
  disconnected: {
    state: "disconnected",
    label: "BaoBei is offline",
    detail: "Check the bear's connection",
  },
};

export function getBearPresentation(state) {
  return BEAR_PRESENTATIONS[state] || BEAR_PRESENTATIONS.calm;
}

export function hasCompletedOnboarding(storage = window.localStorage) {
  return storage.getItem(ONBOARDING_KEY) === "true";
}

export function completeOnboarding(storage = window.localStorage) {
  storage.setItem(ONBOARDING_KEY, "true");
}
