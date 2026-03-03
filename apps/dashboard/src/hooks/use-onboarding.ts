import { useState, useCallback, useEffect } from 'react';
import { useSites } from './use-sites';

export type OnboardingStep = 'create-site' | 'install-snippet' | 'verify' | 'done';

const STEPS: OnboardingStep[] = ['create-site', 'install-snippet', 'verify', 'done'];

function getStorageKey(): string {
  return 'onboarding:step';
}

export function useOnboarding() {
  const { data: sitesData } = useSites();
  const hasSites = (sitesData?.data?.length ?? 0) > 0;

  const [step, setStepState] = useState<OnboardingStep>(() => {
    const saved = localStorage.getItem(getStorageKey());
    if (saved && STEPS.includes(saved as OnboardingStep)) {
      return saved as OnboardingStep;
    }
    return 'create-site';
  });

  // Auto-skip create-site if user already has sites
  useEffect(() => {
    if (hasSites && step === 'create-site') {
      setStepState('install-snippet');
      localStorage.setItem(getStorageKey(), 'install-snippet');
    }
  }, [hasSites, step]);

  const setStep = useCallback((newStep: OnboardingStep) => {
    setStepState(newStep);
    localStorage.setItem(getStorageKey(), newStep);
  }, []);

  const nextStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(step);
    const next = STEPS[currentIndex + 1];
    if (next) {
      setStep(next);
    }
  }, [step, setStep]);

  const stepIndex = STEPS.indexOf(step);

  return {
    step,
    stepIndex,
    totalSteps: STEPS.length - 1, // don't count 'done' as a visible step
    setStep,
    nextStep,
    isComplete: step === 'done',
  };
}
