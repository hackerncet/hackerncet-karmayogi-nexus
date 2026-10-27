// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Modal } from "../src/components/ui/primitives";
import { Button } from "../src/components/ui/button";
afterEach(cleanup);
describe("accessible reusable components", () => {
  it("links a dialog to its title and descriptive text and closes with Escape", async () => {
    render(
      <Modal
        trigger={<Button>Review source</Button>}
        title="Review supporting evidence"
        description="Validate the exact source before approving."
      >
        <p>Sampling evidence</p>
      </Modal>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Review source" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName("Review supporting evidence");
    expect(dialog).toHaveAccessibleDescription(
      "Validate the exact source before approving.",
    );
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
