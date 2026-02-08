import { useState, useEffect } from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";


const ONBOARDING_KEY = "flowdesk_onboarding_complete";

const tourSteps: Step[] = [
    {
        target: "body",
        content: (
            <div className="text-center">
                <h2 className="text-lg font-bold mb-2">Welcome to FlowDesk! 🚀</h2>
                <p>A generative UI engine that builds React apps from natural language.</p>
            </div>
        ),
        placement: "center",
        disableBeacon: true,
    },
    {
        target: '[data-tour="chat-input"]',
        content: (
            <div>
                <h3 className="font-semibold mb-1">Chat with AI</h3>
                <p>Describe what you want to build. Try: "Create a coding workspace" or "Build an expense tracker"</p>
            </div>
        ),
        placement: "top",
    },
    {
        target: '[data-tour="tab-switcher"]',
        content: (
            <div>
                <h3 className="font-semibold mb-1">Switch Tabs</h3>
                <p>Chat shows your conversation. Dashboard displays the generated UI components.</p>
            </div>
        ),
        placement: "bottom",
    },
    {
        target: '[data-tour="theme-toggle"]',
        content: (
            <div>
                <h3 className="font-semibold mb-1">Theme Toggle</h3>
                <p>Switch between light and dark modes for comfortable viewing.</p>
            </div>
        ),
        placement: "left",
    },
    {
        target: '[data-tour="command-palette"]',
        content: (
            <div>
                <h3 className="font-semibold mb-1">Command Palette</h3>
                <p>Press <kbd className="bg-muted px-1 rounded">Ctrl+K</kbd> anytime to quickly navigate, switch themes, or launch workspace templates!</p>
            </div>
        ),
        placement: "bottom",
    },
    {
        target: "body",
        content: (
            <div className="text-center">
                <h2 className="text-lg font-bold mb-2">You're all set! ✨</h2>
                <p>Start by typing a request in the chat to build your first UI.</p>
            </div>
        ),
        placement: "center",
    },
];

interface OnboardingTourProps {
    onComplete?: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps): JSX.Element | null {
    const [run, setRun] = useState(false);


    useEffect(() => {
        const completed = localStorage.getItem(ONBOARDING_KEY);
        if (!completed) {
            // Delay start to let the UI settle
            const timer = setTimeout(() => setRun(true), 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleCallback = (data: CallBackProps) => {
        const { status } = data;

        if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
            setRun(false);
            localStorage.setItem(ONBOARDING_KEY, "true");
            onComplete?.();
        }
    };

    const styles = {
        options: {
            arrowColor: "#ffffff",
            backgroundColor: "#ffffff",
            overlayColor: "rgba(0, 0, 0, 0.5)",
            primaryColor: "#8b5cf6",
            textColor: "#1e293b",
            zIndex: 1000,
        },
        tooltip: {
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        },
        tooltipContainer: {
            textAlign: "left" as const,
        },
        buttonNext: {
            backgroundColor: "#8b5cf6",
            borderRadius: "8px",
            padding: "8px 16px",
            fontWeight: 500,
        },
        buttonBack: {
            color: "#64748b",
            marginRight: 8,
        },
        buttonSkip: {
            color: "#94a3b8",
        },
    };

    return (
        <Joyride
            steps={tourSteps}
            run={run}
            continuous
            showProgress
            showSkipButton
            disableOverlayClose
            spotlightClicks={false}
            callback={handleCallback}
            styles={styles}
            locale={{
                back: "Back",
                close: "Close",
                last: "Get Started!",
                next: "Next",
                skip: "Skip Tour",
            }}
        />
    );
}

export function resetOnboarding() {
    localStorage.removeItem(ONBOARDING_KEY);
}

export function isOnboardingComplete(): boolean {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
}
