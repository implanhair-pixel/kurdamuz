type ConfettiOptions = Record<string, unknown>;
type ConfettiInstance = ((options?: ConfettiOptions) => void) & { reset: () => void };

const createInstance = (): ConfettiInstance => {
  const instance = (() => undefined) as ConfettiInstance;
  instance.reset = () => undefined;
  return instance;
};

const confetti = (() => undefined) as ConfettiInstance & {
  create: (canvas?: HTMLCanvasElement | null, options?: ConfettiOptions) => ConfettiInstance;
};

confetti.reset = () => undefined;
confetti.create = () => createInstance();

export default confetti;
