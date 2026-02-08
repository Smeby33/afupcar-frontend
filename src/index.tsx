import './index.css';
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Toaster } from 'sonner';

// Debug helper: wrap Node.prototype.insertBefore to log stack when it throws
try {
  const _origInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode: Node, referenceNode: Node | null) {
    try {
      // @ts-ignore
      return _origInsertBefore.call(this, newNode, referenceNode);
    } catch (err) {
      // Log contextual information to help find the caller
      console.error('[DEBUG] insertBefore threw:', err, { thisNode: this, referenceNode });
      console.error(new Error().stack);
      throw err;
    }
  };
} catch (e) {
  // ignore in non-browser environments
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <>
      <App />
      <Toaster richColors position="top-right" />
    </>
  );
}