/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Wrench, Users, X, ArrowRight } from 'lucide-react';
import Stepper, { Step } from './Stepper';
import Button from './Button';

const StepContent = ({ icon, iconBg, title, description, action }) => (
  <div className="text-center space-y-6">
    <div className={`w-20 h-20 ${iconBg} rounded-full flex items-center justify-center mx-auto`}>
      {icon}
    </div>
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-400">{description}</p>
    </div>
    {action}
  </div>
);

const OnboardingFlow = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isVisible, setIsVisible] = useState(true);
  const [hasExploredMarket, setHasExploredMarket] = useState(false);
  const [hasExploredServices, setHasExploredServices] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/market' && currentStep === 2) setHasExploredMarket(true);
    if (location.pathname === '/services' && currentStep === 3) setHasExploredServices(true);
  }, [location.pathname, currentStep]);

  const handleNext = () => {
    if (currentStep === 1) {
      navigate('/market');
      setCurrentStep(2);
    } else if (currentStep === 2 && hasExploredMarket) {
      navigate('/services');
      setCurrentStep(3);
    } else if (currentStep === 3 && hasExploredServices) {
      setCurrentStep(4);
    }
  };

  const handleStepChange = (step) => setCurrentStep(step);

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => onComplete?.(), 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => onSkip?.(), 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-lg animate-scale-in">
        <button
          onClick={handleSkip}
          className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="bg-[#121212] rounded-2xl border border-white/10 overflow-hidden">
          <Stepper
            initialStep={currentStep}
            onStepChange={handleStepChange}
            onFinalStepCompleted={handleComplete}
            stepCircleContainerClassName="bg-transparent"
            stepContainerClassName="justify-center pt-6 pb-2"
            contentClassName="py-6"
            footerClassName="pb-6"
            nextButtonText={currentStep === 4 ? 'Get Started' : 'Next'}
            backButtonText="Back"
            disableStepIndicators={true}
          >
            <Step>
              <StepContent
                icon={<span className="text-4xl font-bold text-accent">CN</span>}
                iconBg="bg-accent/20"
                title="Welcome to Campus Nodes"
                description="Your decentralized marketplace for everything on campus. Trade gear, find services, and build your network."
                action={
                  <Button onClick={handleNext} className="w-full">
                    Start Tour <ArrowRight size={18} className="ml-2" />
                  </Button>
                }
              />
            </Step>

            <Step>
              <StepContent
                icon={<ShoppingCart size={40} className="text-green-500" />}
                iconBg="bg-green-500/20"
                title="Explore the Marketplace"
                description="Browse textbooks, electronics, stationery, and more. Click on any product to view details or add to cart."
                action={
                  hasExploredMarket ? (
                    <Button onClick={handleNext} className="w-full">
                      Continue <ArrowRight size={18} className="ml-2" />
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-accent">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                      <span className="text-sm">Click a product to continue...</span>
                    </div>
                  )
                }
              />
            </Step>

            <Step>
              <StepContent
                icon={<Wrench size={40} className="text-purple-500" />}
                iconBg="bg-purple-500/20"
                title="Discover Services"
                description="Find tutors, repair services, design help, and more from talented students on campus."
                action={
                  hasExploredServices ? (
                    <Button onClick={handleNext} className="w-full">
                      Continue <ArrowRight size={18} className="ml-2" />
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-purple-400">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                      <span className="text-sm">Explore a service to continue...</span>
                    </div>
                  )
                }
              />
            </Step>

            <Step>
              <StepContent
                icon={<Users size={40} className="text-blue-500" />}
                iconBg="bg-blue-500/20"
                title="Connect with Others"
                description="Sign up to add friends, message sellers, and unlock the full Campus Nodes experience."
                action={
                  <div className="space-y-3">
                    <Button to="/signup" variant="primary" className="w-full">Create Account</Button>
                    <Button to="/login" variant="outline" className="w-full">Sign In</Button>
                    <button onClick={handleComplete} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                      Skip for now
                    </button>
                  </div>
                }
              />
            </Step>
          </Stepper>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === currentStep ? 'bg-accent w-6' : step < currentStep ? 'bg-accent/50 w-2' : 'bg-white/20 w-2'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
