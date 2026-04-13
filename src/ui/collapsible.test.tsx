import { renderHook, render, act, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  useCollapsible,
} from "./collapsible";
import type { ReactNode } from "react";

beforeEach(() => {
  localStorage.clear();
});

function fireKey(key: string, modifiers: Partial<KeyboardEvent> = {}) {
  window.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, ...modifiers }),
  );
}

describe("Collapsible", () => {
  it("defaults to open", () => {
    function Inner() {
      const { open } = useCollapsible();
      return <span data-testid="state">{String(open)}</span>;
    }
    render(
      <Collapsible>
        <Inner />
      </Collapsible>,
    );
    expect(screen.getByTestId("state").textContent).toBe("true");
  });

  it("respects defaultOpen=false", () => {
    function Inner() {
      const { open } = useCollapsible();
      return <span data-testid="state">{String(open)}</span>;
    }
    render(
      <Collapsible defaultOpen={false}>
        <Inner />
      </Collapsible>,
    );
    expect(screen.getByTestId("state").textContent).toBe("false");
  });

  it("toggles state", () => {
    function Inner() {
      const { open, toggle } = useCollapsible();
      return (
        <>
          <span data-testid="state">{String(open)}</span>
          <button data-testid="toggle" onClick={toggle} />
        </>
      );
    }
    render(
      <Collapsible>
        <Inner />
      </Collapsible>,
    );
    expect(screen.getByTestId("state").textContent).toBe("true");
    act(() => {
      screen.getByTestId("toggle").click();
    });
    expect(screen.getByTestId("state").textContent).toBe("false");
  });

  it("persists state when storageKey is set", () => {
    function Inner() {
      const { open, toggle } = useCollapsible();
      return (
        <>
          <span data-testid="state">{String(open)}</span>
          <button data-testid="toggle" onClick={toggle} />
        </>
      );
    }
    const { unmount } = render(
      <Collapsible storageKey="panel">
        <Inner />
      </Collapsible>,
    );
    act(() => {
      screen.getByTestId("toggle").click();
    });
    expect(localStorage.getItem("panel")).toBe(JSON.stringify(false));
    unmount();

    // Re-mount — should read persisted value
    render(
      <Collapsible storageKey="panel">
        <Inner />
      </Collapsible>,
    );
    expect(screen.getByTestId("state").textContent).toBe("false");
  });

  it("registers keyboard shortcut", () => {
    function Inner() {
      const { open } = useCollapsible();
      return <span data-testid="state">{String(open)}</span>;
    }
    render(
      <Collapsible shortcut="mod+[">
        <Inner />
      </Collapsible>,
    );
    expect(screen.getByTestId("state").textContent).toBe("true");
    act(() => {
      fireKey("[", { ctrlKey: true });
    });
    expect(screen.getByTestId("state").textContent).toBe("false");
  });
});

describe("CollapsibleTrigger", () => {
  it("renders children and toggles on click", () => {
    function Inner() {
      const { open } = useCollapsible();
      return <span data-testid="state">{String(open)}</span>;
    }
    render(
      <Collapsible>
        <CollapsibleTrigger>
          <button data-testid="btn">Toggle</button>
        </CollapsibleTrigger>
        <Inner />
      </Collapsible>,
    );
    expect(screen.getByTestId("state").textContent).toBe("true");
    act(() => {
      screen.getByTestId("btn").click();
    });
    expect(screen.getByTestId("state").textContent).toBe("false");
  });

  it("supports render-prop children", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>
          {({ open }) => (
            <button data-testid="btn">{open ? "Close" : "Open"}</button>
          )}
        </CollapsibleTrigger>
      </Collapsible>,
    );
    expect(screen.getByTestId("btn").textContent).toBe("Close");
    act(() => {
      screen.getByTestId("btn").click();
    });
    expect(screen.getByTestId("btn").textContent).toBe("Open");
  });
});

describe("CollapsibleContent", () => {
  it("passes open state via render prop", () => {
    render(
      <Collapsible defaultOpen={false}>
        <CollapsibleContent>
          {({ open }) => (open ? <div data-testid="content">visible</div> : null)}
        </CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.queryByTestId("content")).toBeNull();
  });

  it("renders plain children regardless of state", () => {
    render(
      <Collapsible defaultOpen={false}>
        <CollapsibleContent>
          <div data-testid="content">always here</div>
        </CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.getByTestId("content")).toBeTruthy();
  });
});
