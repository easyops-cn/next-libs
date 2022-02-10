import { setImmediate as flushMicroTasks } from "timers";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

// Ref https://github.com/facebook/jest/issues/2157#issuecomment-279171856
(global as any).flushPromises = () =>
  new Promise((resolve) => flushMicroTasks(resolve));

Element.prototype.scrollIntoView = jest.fn();
(SVGElement as any).prototype.getTotalLength = jest.fn();
(SVGElement as any).prototype.getPointAtLength = jest.fn();

if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

(global as any).ace = {
  define: jest.fn(),
  acequire: jest.fn(),
};
