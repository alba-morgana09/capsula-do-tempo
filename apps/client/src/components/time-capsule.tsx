"use client";

import { useEffect, useState } from "react";

type CapsuleContent = {
  pipeline: string;
  objectives: string;
  message: string;
};

type SavedCapsule = CapsuleContent & {
  sealedAt: string;
};

type CapsuleField = keyof CapsuleContent;

const CAPSULE_KEY = "telemetria-para-o-amanha:capsule";
const DRAFT_KEY = "telemetria-para-o-amanha:draft";
const OPENING_TIMESTAMP = new Date(2028, 9, 3).getTime();

const EMPTY_CONTENT: CapsuleContent = {
  pipeline: "",
  objectives: "",
  message: "",
};

const FIELDS: { name: CapsuleField; label: string; prompt: string }[] = [
  {
    name: "pipeline",
    label: "Estado atual da pipeline",
    prompt:
      "Onde estou hoje? Que desafios estou enfrentando, o que estou aprendendo e qual mentalidade quero levar comigo?",
  },
  {
    name: "objectives",
    label: "Métricas de sucesso & SLOs",
    prompt:
      "O que quero ter construído ou aprendido até 2028? Como vou reconhecer meu progresso?",
  },
  {
    name: "message",
    label: "Mensagem para o meu eu do futuro",
    prompt:
      "O que preciso lembrar sobre minha resiliência, minha bagagem e o caminho que estou construindo?",
  },
];

function isCapsuleContent(value: unknown): value is CapsuleContent {
  if (typeof value !== "object" || value === null) return false;
  const content = value as Record<string, unknown>;
  return (
    typeof content.pipeline === "string" &&
    typeof content.objectives === "string" &&
    typeof content.message === "string"
  );
}

function isSavedCapsule(value: unknown): value is SavedCapsule {
  return (
    isCapsuleContent(value) &&
    typeof (value as Record<string, unknown>).sealedAt === "string"
  );
}

export default function TimeCapsule() {
  const [content, setContent] = useState<CapsuleContent>(EMPTY_CONTENT);
  const [capsule, setCapsule] = useState<SavedCapsule | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(0);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CAPSULE_KEY);
      const draft = localStorage.getItem(DRAFT_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isSavedCapsule(parsed)) setCapsule(parsed);
      } else if (draft) {
        const parsed: unknown = JSON.parse(draft);
        if (isCapsuleContent(parsed)) setContent(parsed);
      }
    } catch {
      setStorageError(true);
    }

    setNow(Date.now());
    setHydrated(true);
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!hydrated || capsule) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(content));
    } catch {
      setStorageError(true);
    }
  }, [capsule, content, hydrated]);

  const isOpen = capsule !== null && now >= OPENING_TIMESTAMP;
  const isComplete = Object.values(content).every((value) => value.trim());

  function updateContent(field: CapsuleField, value: string) {
    setContent((current) => ({ ...current, [field]: value }));
  }

  function sealCapsule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isComplete) return;

    const savedCapsule: SavedCapsule = {
      ...content,
      sealedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(CAPSULE_KEY, JSON.stringify(savedCapsule));
      setCapsule(savedCapsule);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        setStorageError(true);
      }
    } catch {
      setStorageError(true);
    }
  }

  function resetCapsule() {
    if (!window.confirm("Apagar esta cápsula e começar de novo?")) return;
    try {
      localStorage.removeItem(CAPSULE_KEY);
      localStorage.removeItem(DRAFT_KEY);
      setCapsule(null);
      setContent(EMPTY_CONTENT);
      setNow(Date.now());
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }

  return (
    <main className="capsule-page">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="Cápsula do tempo, início">
          <span className="wordmark-mark" aria-hidden="true">
            T
          </span>
          <span>ARQUIVO PESSOAL</span>
        </a>
        <span className="topbar-note">OBSERVABILIDADE · SECOPS</span>
      </header>

      <div className="capsule-layout">
        <section className="intro" aria-labelledby="capsule-title">
          <p className="eyebrow">
            <span className="signal-dot" aria-hidden="true" />
            CÁPSULA DO TEMPO <span className="eyebrow-divider">/</span> 001
          </p>
          <h1 id="capsule-title">
            Telemetria
            <br />
            <span>para o Amanhã</span>
          </h1>
          <p className="subtitle">
            Hoje eu coleto sinais; no futuro, desenho arquiteturas que sabem
            responder.
          </p>

          <div className="date-track" aria-label="Datas da cápsula">
            <div className="date-track-line" aria-hidden="true" />
            <div className="date-item">
              <span className="date-node date-node-filled" aria-hidden="true" />
              <div>
                <span className="date-label">SELADA EM</span>
                <time dateTime="2026-10-03">03 de outubro de 2026</time>
              </div>
            </div>
            <div className="date-item">
              <span className="date-node" aria-hidden="true" />
              <div>
                <span className="date-label">ABERTURA PROGRAMADA</span>
                <time dateTime="2028-10-03">03 de outubro de 2028</time>
              </div>
            </div>
          </div>

          <p className="privacy-note">
            <span aria-hidden="true">LOCAL</span>
            Guardada neste navegador. Sua carta não é enviada a um servidor.
          </p>
        </section>

        <section className="workspace" aria-label="Conteúdo da cápsula">
          {!hydrated ? (
            <div className="workspace-loading" aria-label="Carregando cápsula">
              <span className="loading-line" />
              <span className="loading-line loading-line-short" />
              <span className="loading-line loading-line-tall" />
            </div>
          ) : capsule && !isOpen ? (
            <div className="sealed-state" aria-live="polite">
              <div className="state-overline">
                <span className="lock-mark" aria-hidden="true">
                  ◈
                </span>
                SINAL CONTIDO
              </div>
              <h2>Sua cápsula está selada.</h2>
              <p>
                As palavras que você guardou estarão disponíveis aqui a partir
                de 03 de outubro de 2028. Até lá, deixe o futuro em silêncio.
              </p>
              <div className="sealed-stamp">
                <span>STATUS</span>
                <strong>AGUARDANDO JANELA DE ABERTURA</strong>
              </div>
              <button className="text-action" type="button" onClick={resetCapsule}>
                Apagar cápsula
              </button>
            </div>
          ) : capsule && isOpen ? (
            <div className="opened-state" aria-live="polite">
              <div className="state-overline state-overline-open">
                <span className="signal-dot" aria-hidden="true" />
                SINAL LIBERADO · 03 OUT 2028
              </div>
              <h2>Uma mensagem através do tempo.</h2>
              {FIELDS.map((field, index) => (
                <article className="letter-section" key={field.name}>
                  <span className="letter-index">0{index + 1}</span>
                  <div>
                    <h3>{field.label}</h3>
                    <p>{capsule[field.name]}</p>
                  </div>
                </article>
              ))}
              <button className="text-action" type="button" onClick={resetCapsule}>
                Criar outra cápsula
              </button>
            </div>
          ) : (
            <form className="capsule-form" onSubmit={sealCapsule}>
              <div className="form-heading">
                <div>
                  <p className="form-kicker">SEU REGISTRO COMEÇA AQUI</p>
                  <h2>Escreva para o futuro.</h2>
                </div>
                <span className="draft-indicator">
                  <span className="draft-dot" aria-hidden="true" />
                  RASCUNHO
                </span>
              </div>

              {FIELDS.map((field, index) => (
                <label className="field" key={field.name}>
                  <span className="field-heading">
                    <span className="field-index">0{index + 1}</span>
                    {field.label}
                  </span>
                  <textarea
                    name={field.name}
                    rows={index === 1 ? 3 : 4}
                    value={content[field.name]}
                    onChange={(event) =>
                      updateContent(field.name, event.target.value)
                    }
                    placeholder={field.prompt}
                    required
                  />
                </label>
              ))}

              <div className="form-footer">
                <p>O rascunho é salvo automaticamente neste navegador.</p>
                <button className="seal-button" type="submit" disabled={!isComplete}>
                  <span>Selar cápsula</span>
                  <span className="button-arrow" aria-hidden="true">
                    ↗
                  </span>
                </button>
              </div>
            </form>
          )}
          {storageError && (
            <p className="storage-alert" role="alert">
              Não foi possível acessar o armazenamento deste navegador. Mantenha
              esta página aberta para não perder seu texto.
            </p>
          )}
        </section>
      </div>

      <footer className="page-footer">
        <span>REGISTRO DE UMA JORNADA EM CONSTRUÇÃO</span>
        <span>ABERTURA PROGRAMADA · 03 OUT 2028</span>
      </footer>
    </main>
  );
}