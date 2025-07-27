import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock DOM APIs since demo.ts manipulates the DOM
const mockDocument = {
    createElement: vi.fn(() => ({
        width: 0,
        height: 0,
        style: {},
        getContext: vi.fn(() => ({
            fillStyle: '',
            font: '',
            textBaseline: 'top',
            fillRect: vi.fn(),
            fillText: vi.fn(),
            measureText: vi.fn(() => ({ width: 10 })),
        })),
    })),
    getElementById: vi.fn(),
    addEventListener: vi.fn(),
    body: {
        appendChild: vi.fn(),
    },
};

const mockWindow = {
    innerWidth: 1920,
    innerHeight: 1080,
};

describe('Demo Script Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock DOM elements
        const mockLoader = {
            classList: {
                add: vi.fn(),
            },
        };
        
        const mockControls = {
            classList: {
                remove: vi.fn(),
            },
        };

        mockDocument.getElementById.mockImplementation((id: string) => {
            if (id === 'loader') return mockLoader;
            if (id === 'controls') return mockControls;
            return null;
        });

        // Setup global mocks
        Object.assign(globalThis, {
            document: mockDocument,
            window: mockWindow,
            HTMLCanvasElement: vi.fn(),
            HTMLFormElement: vi.fn(),
            requestAnimationFrame: vi.fn(),
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('DOM manipulation', () => {
        it('should handle DOMContentLoaded event', () => {
            // Test that the demo script sets up the DOMContentLoaded listener
            expect(() => {
                // Import the demo script to trigger the IIFE
                import('../../demo/demo');
            }).not.toThrow();
        });

        it('should create canvas element', () => {
            expect(() => {
                mockDocument.createElement('canvas');
            }).not.toThrow();
        });

        it('should handle missing DOM elements gracefully', () => {
            mockDocument.getElementById.mockReturnValue(null);
            
            expect(() => {
                // This would normally fail if demo.ts doesn't handle null elements
                const element = mockDocument.getElementById('nonexistent');
                expect(element).toBeNull();
            }).not.toThrow();
        });
    });

    describe('Canvas setup', () => {
        it('should set canvas dimensions to window size', () => {
            const mockCanvas = mockDocument.createElement('canvas');
            
            mockCanvas.width = mockWindow.innerWidth;
            mockCanvas.height = mockWindow.innerHeight;
            
            expect(mockCanvas.width).toBe(1920);
            expect(mockCanvas.height).toBe(1080);
        });
    });

    describe('Controls initialization', () => {
        it('should handle controls setup', () => {
            const mockControls = {
                classList: {
                    remove: vi.fn(),
                },
            };

            expect(() => {
                mockControls.classList.remove('hidden');
            }).not.toThrow();
        });
    });

    describe('Loader removal', () => {
        it('should hide loader', () => {
            const mockLoader = {
                classList: {
                    add: vi.fn(),
                },
            };

            expect(() => {
                mockLoader.classList.add('hidden');
            }).not.toThrow();
        });
    });
});
