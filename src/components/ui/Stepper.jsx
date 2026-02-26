import { useState, Children, useRef, useLayoutEffect } from 'react';

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = '',
  stepContainerClassName = '',
  contentClassName = '',
  footerClassName = '',
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  disableStepIndicators = false,
  renderStepIndicator,
  ...rest
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = newStep => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) onFinalStepCompleted();
    else onStepChange(newStep);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  return (
    <div className={`flex min-h-full flex-1 flex-col items-center justify-center p-4 sm:aspect-[4/3] md:aspect-[2/1] ${stepCircleContainerClassName}`} {...rest}>
      <div className="mx-auto w-full max-w-md rounded-2xl shadow-xl border border-white/10">
        <div className={`${stepContainerClassName} flex w-full items-center p-8`}>
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            const status = currentStep === stepNumber ? 'active' : currentStep < stepNumber ? 'inactive' : 'complete';
            
            const handleStepClick = () => {
              if (stepNumber !== currentStep && !disableStepIndicators) {
                setDirection(stepNumber > currentStep ? 1 : -1);
                updateStep(stepNumber);
              }
            };

            return (
              <div key={stepNumber} className="flex items-center flex-1">
                {renderStepIndicator ? (
                  renderStepIndicator({ step: stepNumber, currentStep, onStepClick: handleStepClick })
                ) : (
                  <button
                    onClick={handleStepClick}
                    disabled={disableStepIndicators}
                    className={`w-8 h-8 rounded-full font-semibold flex items-center justify-center transition-all duration-300 ${
                      status === 'complete' ? 'bg-accent text-black' :
                      status === 'active' ? 'bg-accent text-black ring-2 ring-accent ring-offset-2 ring-offset-[#121212]' :
                      'bg-white/10 text-gray-400 hover:bg-white/20'
                    }`}
                  >
                    {status === 'complete' ? '✓' : stepNumber}
                  </button>
                )}
                {isNotLastStep && (
                  <div className="flex-1 h-0.5 mx-2 bg-white/10 rounded overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all duration-400"
                      style={{ width: currentStep > stepNumber ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={`space-y-2 px-8 ${contentClassName}`}>
          <StepContentWrapper direction={direction}>
            {stepsArray[currentStep - 1]}
          </StepContentWrapper>
        </div>

        {!isCompleted && (
          <div className={`px-8 pb-8 ${footerClassName}`}>
            <div className={`mt-10 flex ${currentStep !== 1 ? 'justify-between' : 'justify-end'}`}>
              {currentStep !== 1 && (
                <button
                  onClick={handleBack}
                  className="text-gray-400 hover:text-white transition-colors px-2 py-1"
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              )}
              <button
                onClick={isLastStep ? handleComplete : handleNext}
                className="bg-accent text-black font-medium px-4 py-2 rounded-full hover:bg-accent/90 transition-colors"
                {...nextButtonProps}
              >
                {isLastStep ? 'Complete' : nextButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepContentWrapper({ direction, children }) {
  const [height, setHeight] = useState('auto');
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setHeight(containerRef.current.offsetHeight);
    }
  }, [children]);

  const enterClass = direction >= 0 ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0';

  return (
    <div style={{ height }} className="relative overflow-hidden">
      <div 
        ref={containerRef}
        className={`transition-all duration-400 ${enterClass} animate-slide-in`}
        style={{ animation: 'slideIn 0.4s ease-out forwards' }}
      >
        {children}
      </div>
    </div>
  );
}

export function Step({ children }) {
  return <div className="px-8">{children}</div>;
}
