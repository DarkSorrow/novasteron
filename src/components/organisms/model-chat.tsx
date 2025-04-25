import {useCallback, useLayoutEffect, useRef, useEffect, useState} from "react";
import { useTranslation } from "react-i18next";
import {llmState} from "../../state/llmState.ts";
import {electronLlmRpc} from "../../rpc/llmRpc.ts";
import {useExternalState} from "../../hooks/useExternalState.ts";
import {SearchIconSVG} from "../../icons/SearchIconSVG.tsx";
import {StarIconSVG} from "../../icons/StarIconSVG.tsx";
import {DownloadIconSVG} from "../../icons/DownloadIconSVG.tsx";
import {Header} from "../../App/components/Header/Header.tsx";
import {ChatHistory} from "../../App/components/ChatHistory/ChatHistory.tsx";
import {InputRow} from "../../App/components/InputRow/InputRow.tsx";


// Import the minimal theme CSS
import "./App.css";
import Stack from "@mui/material/Stack";

export const ModelChat = () => {
const state = useExternalState(llmState);
const {generatingResult} = state.chatSession;
const isScrollAnchoredRef = useRef(false);
const lastAnchorScrollTopRef = useRef<number>(0);
const {t, i18n} = useTranslation();
const [isAppReady, setIsAppReady] = useState(false);
const appReadySentRef = useRef(false);
// Signal that the app is ready to show once UI is fully loaded

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
    <Header
        appVersion={state.appVersion}
        canShowCurrentVersion={state.selectedModelFilePath == null}
        modelName={state.model.name}
        loadPercentage={state.model.loadProgress}
        onLoadClick={openSelectModelFileDialog}
        onResetChatClick={
            !showMessage
                ? resetChatHistory
                : undefined
        }
    />
    {
      showMessage &&
      <div className="message">
          {
              error != null &&
              <div className="error">
                  {String(error)}
              </div>
          }
          {
              loading &&
              <div className="loading">
                  Loading...
              </div>
          }
          {
              (state.selectedModelFilePath == null || state.llama.error != null) &&
              <div className="loadModel">
                  <div className="hint">Click the button above to load a model {t('nav.home')}</div>
                  <div className="actions">
                      <a className="starLink" target="_blank" href="https://github.com/withcatai/node-llama-cpp">
                          <StarIconSVG className="starIcon" />
                          <div className="text">
                              Star <code>node-llama-cpp</code> on GitHub
                          </div>
                      </a>

                      <div className="separator"></div>
                      <div className="title">DeepSeek R1 Distill Qwen model</div>
                      <div className="links">
                          <a
                              target="_blank"
                              href="https://huggingface.co/mradermacher/DeepSeek-R1-Distill-Qwen-7B-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-7B.Q4_K_M.gguf"
                          >
                              <DownloadIconSVG className="downloadIcon" />
                              <div className="text">Get 7B</div>
                          </a>
                          <div className="separator" />
                          <a
                              target="_blank"
                              href="https://huggingface.co/mradermacher/DeepSeek-R1-Distill-Qwen-14B-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-14B.Q4_K_M.gguf"
                          >
                              <DownloadIconSVG className="downloadIcon" />
                              <div className="text">Get 14B</div>
                          </a>
                          <div className="separator" />
                          <a
                              target="_blank"
                              href="https://huggingface.co/mradermacher/DeepSeek-R1-Distill-Qwen-32B-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-32B.Q4_K_M.gguf"
                          >
                              <DownloadIconSVG className="downloadIcon" />
                              <div className="text">Get 32B</div>
                          </a>
                      </div>

                      <div className="separator"></div>
                      <div className="title">Other models</div>
                      <div className="links">
                          <a
                              target="_blank"
                              href="https://huggingface.co/mradermacher/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct.Q4_K_M.gguf"
                          >
                              <DownloadIconSVG className="downloadIcon" />
                              <div className="text">Get Llama 3.1 8B</div>
                          </a>
                          <div className="separator" />
                          <a
                              target="_blank"
                              href="https://huggingface.co/bartowski/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q4_K_M.gguf"
                          >
                              <DownloadIconSVG className="downloadIcon" />
                              <div className="text">Get Gemma 2 2B</div>
                          </a>
                      </div>

                      <div className="separator"></div>
                      <a className="browseLink" target="_blank" href="https://huggingface.co/models?pipeline_tag=text-generation&library=gguf&sort=trending">
                          <SearchIconSVG className="searchIcon" />
                          <div className="text">Find more models</div>
                      </a>
                  </div>
              </div>
          }
          {
              (
                  !loading &&
                  state.selectedModelFilePath != null &&
                  error == null &&
                  state.chatSession.simplifiedChat.length === 0
              ) &&
              <div className="typeMessage">
                  Type a message to start the conversation
              </div>
          }
      </div>
  }
  {
      !showMessage &&
      <ChatHistory
          className="chatHistory"
          simplifiedChat={state.chatSession.simplifiedChat}
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
