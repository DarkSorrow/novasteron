import {useCallback, useLayoutEffect, useRef, useEffect, useState} from "react";
import { useTranslation } from "react-i18next";
import {llmState} from "../state/llmState.ts";
import {electronLlmRpc} from "../rpc/llmRpc.ts";
import {useExternalState} from "../hooks/useExternalState.ts";
import {SearchIconSVG} from "../icons/SearchIconSVG.tsx";
import {StarIconSVG} from "../icons/StarIconSVG.tsx";
import {DownloadIconSVG} from "../icons/DownloadIconSVG.tsx";
import {ChatHistory} from "./components/ChatHistory/ChatHistory.tsx";
import {InputRow} from "./components/InputRow/InputRow.tsx";


// Import the minimal theme CSS
import "./App.css";
import Stack from "@mui/material/Stack";

export const App = () => {
const state = useExternalState(llmState);
const {generatingResult} = state.chatSession;
const isScrollAnchoredRef = useRef(false);
const lastAnchorScrollTopRef = useRef<number>(0);

const scrollToBottom = useCallback(() => {
    const newScrollTop = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    if (newScrollTop > document.documentElement.scrollTop && newScrollTop > lastAnchorScrollTopRef.current) {
        document.documentElement.scrollTo({
            top: newScrollTop,
            behavior: "smooth"
        });
        lastAnchorScrollTopRef.current = document.documentElement.scrollTop;
    }

    isScrollAnchoredRef.current = true;
}, []);

  useLayoutEffect(() => {
    // Track if user has scrolled away from bottom
    let userHasScrolledUp = false;

    // Check if scrolled to bottom
    const isAtBottom = () => {
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      return Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
    };

    // Scroll to bottom function
    const scrollToBottom = () => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    };

    // Handle scroll events
    function onScroll() {
      userHasScrolledUp = !isAtBottom();
    }

    // Handle content changes
    const observer = new ResizeObserver(() => {
      if (!userHasScrolledUp) {
        scrollToBottom();
      }
    });

    // Set up listeners
    window.addEventListener("scroll", onScroll, {passive: true});
    observer.observe(document.body, { box: "border-box" });

    // Initial scroll to bottom
    scrollToBottom();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const openSelectModelFileDialog = useCallback(async () => {
    await electronLlmRpc.selectModelFileAndLoad();
  }, []);

  const stopActivePrompt = useCallback(() => {
    void electronLlmRpc.stopActivePrompt();
  }, []);

  const resetChatHistory = useCallback(() => {
    void electronLlmRpc.stopActivePrompt();
    void electronLlmRpc.resetChatHistory();
  }, []);

  const sendPrompt = useCallback((prompt: string) => {
    if (generatingResult)
      return;
    scrollToBottom();
    void electronLlmRpc.prompt(prompt);
  }, [generatingResult, scrollToBottom]);

  const onPromptInput = useCallback((currentText: string) => {
    void electronLlmRpc.setDraftPrompt(currentText);
  }, []);

  const error = state.llama.error ?? state.model.error ?? state.context.error ?? state.contextSequence.error;
  const loading = state.selectedModelFilePath != null && error == null && (
    !state.model.loaded || !state.llama.loaded || !state.context.loaded || !state.contextSequence.loaded || !state.chatSession.loaded
  );
  const showMessage = state.selectedModelFilePath == null || error != null || state.chatSession.simplifiedChat.length === 0;

return <div className="app">
  {
      <ChatHistory
          className="chatHistory"
          simplifiedChat={state.chatSession.simplifiedChat || []}
          generatingResult={generatingResult}
      />
  }
  <InputRow
    disabled={!state.model.loaded || !state.contextSequence.loaded}
    stopGeneration={
        generatingResult
            ? stopActivePrompt
            : undefined
    }
    onPromptInput={onPromptInput}
    sendPrompt={sendPrompt}
    generatingResult={generatingResult}
    autocompleteInputDraft={state.chatSession.draftPrompt.prompt}
    autocompleteCompletion={state.chatSession.draftPrompt.completion}
  />
</div>;
}
