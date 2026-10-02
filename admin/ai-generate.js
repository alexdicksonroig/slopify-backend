;(() => {
  const style = document.createElement("style")
  style.textContent = `
    .localized-language {
      display: grid;
      gap: 0.45rem;
    }
    .ai-generate-button {
      width: 100%;
    }
    @media (max-width: 600px) {
      .localized-field {
        grid-template-columns: minmax(0, 1fr);
      }
      .localized-language {
        grid-template-columns: minmax(0, 1fr) auto;
      }
    }
    .ai-generate-dialog {
      width: min(100% - 2rem, 480px);
      padding: 0;
      border: 1px solid var(--border, #dce1e7);
      border-radius: 8px;
      color: var(--text, #182433);
      box-shadow: 0 20px 45px rgba(24, 36, 51, 0.24);
    }
    .ai-generate-dialog::backdrop {
      background: rgba(24, 36, 51, 0.5);
    }
    .ai-generate-dialog form {
      display: grid;
      gap: 0.75rem;
      padding: 1.25rem;
    }
    .ai-generate-dialog h2 {
      margin: 0;
      font-size: 1.05rem;
    }
    .ai-generate-dialog p {
      margin: 0;
      color: var(--muted, #667382);
      font-size: 0.82rem;
    }
    .ai-generate-dialog textarea {
      width: 100%;
      min-height: 120px;
      padding: 0.58rem 0.65rem;
      border: 1px solid #cdd5df;
      border-radius: 5px;
      resize: vertical;
    }
    .ai-generate-dialog .ai-generate-error {
      color: var(--danger, #d63939);
    }
    .ai-generate-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
    .ai-generate-spinner {
      width: 0.9rem;
      height: 0.9rem;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: ai-generate-spin 0.7s linear infinite;
    }
    .btn:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }
    @keyframes ai-generate-spin {
      to {
        transform: rotate(360deg);
      }
    }
  `
  document.head.append(style)

  const dialog = document.createElement("dialog")
  dialog.className = "ai-generate-dialog"
  dialog.innerHTML = `
    <form>
      <h2>AI Generate</h2>
      <p class="ai-generate-context"></p>
      <textarea name="prompt" required aria-label="AI prompt" placeholder="Describe what the AI should write…"></textarea>
      <p class="ai-generate-error" role="alert"></p>
      <div class="ai-generate-actions">
        <button class="btn btn-outline" type="button" data-action="cancel">Cancel</button
        ><button class="btn btn-primary" type="submit">Generate</button>
      </div>
    </form>
  `
  document.body.append(dialog)

  const dialogForm = dialog.querySelector("form")
  const fieldSummary = dialog.querySelector(".ai-generate-context")
  const error = dialog.querySelector(".ai-generate-error")
  const submit = dialogForm.querySelector('button[type="submit"]')
  let target = null

  const setLoading = (loading) => {
    submit.disabled = loading
    dialogForm.prompt.disabled = loading
    submit.setAttribute("aria-busy", String(loading))
    submit.replaceChildren(
      ...(loading
        ? [
            Object.assign(document.createElement("span"), { className: "ai-generate-spinner" }),
            "Generating…",
          ]
        : ["Generate"]),
    )
  }

  // Keep Escape from also closing a page modal the field lives in.
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") event.stopPropagation()
  })
  dialog.addEventListener("cancel", (event) => {
    if (submit.disabled) event.preventDefault()
  })
  dialog.querySelector('[data-action="cancel"]').addEventListener("click", () => {
    if (!submit.disabled) dialog.close()
  })

  dialogForm.addEventListener("submit", async (event) => {
    event.preventDefault()
    error.textContent = ""
    const prompt = dialogForm.prompt.value.trim()
    if (!prompt) return
    setLoading(true)
    try {
      const fieldContext = target.context?.().trim()
      const response = await fetch("/admin/ai-generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt,
          label: target.label,
          context: fieldContext || undefined,
          shape: target.shape,
          languages: [...target.select.options].map((option) => option.value),
        }),
      })
      if (response.status === 409) throw new Error("Another generation is running. Try again soon.")
      if (!response.ok) throw new Error()
      const { value } = await response.json()
      target.setValue(value)
      dialog.close()
    } catch (generateError) {
      error.textContent = generateError.message || "Could not generate text. Please try again."
    } finally {
      setLoading(false)
    }
  })

  // Pages register each localized field; the generated value only fills the page's draft,
  // so nothing is saved until the admin reviews it and saves the form.
  window.registerAiGenerate = (field, options) => {
    const select = field.querySelector("select")
    const column = document.createElement("div")
    column.className = "localized-language"
    select.replaceWith(column)

    const button = document.createElement("button")
    button.className = "btn btn-outline ai-generate-button"
    button.type = "button"
    button.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z" /></svg>Generate`
    button.setAttribute("aria-label", `AI generate ${options.label}`)
    button.addEventListener("click", () => {
      if (!select.options.length) return
      target = { ...options, select }
      fieldSummary.textContent = `${options.label} · all languages`
      error.textContent = ""
      dialogForm.reset()
      dialog.showModal()
      dialogForm.prompt.focus()
    })
    column.append(select, button)
  }
})()
