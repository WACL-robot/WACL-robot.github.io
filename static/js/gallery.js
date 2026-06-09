/**
 * WACL interactive task × embodiment gallery
 * No framework dependency — plain JS + HTML video swap.
 */

(function () {
  'use strict';

  // ── Data ──────────────────────────────────────────────────────────────────

  const TASKS = [
    {
      id: 'coffee',
      label: 'Coffee',
      constraintType: 'AxisCone',
      constraintDesc: 'AxisCone — cup axis kept upright throughout.',
      caption: 'Gripper keeps the cup level while the forearm lifts the coffee-machine handle.',
    },
    {
      id: 'cabinet',
      label: 'Cabinet',
      constraintType: 'AxisCone',
      constraintDesc: 'AxisCone — plate normal kept upright throughout.',
      caption: 'Gripper keeps the plate flat while the forearm pushes the cabinet door closed.',
    },
    {
      id: 'button',
      label: 'Button',
      constraintType: 'PositionRegion (sphere)',
      constraintDesc: 'PositionRegion (sphere) — gripper tethered within a fixed radius.',
      caption: 'Gripper stays within a tether-radius sphere while the forearm presses the button.',
    },
    {
      id: 'faucet',
      label: 'Faucet',
      constraintType: 'PositionRegion (half-space)',
      constraintDesc: 'PositionRegion (half-space) — wet pad kept above the sink plane.',
      caption: 'Gripper keeps the wet pad above the sink while the forearm turns the faucet off.',
    },
  ];

  const EMBODIMENTS = [
    { id: 'xarm', label: 'xArm' },
    { id: 'franka', label: 'Franka' },
  ];

  function videoPath(taskId, embodimentId) {
    return `static/videos/tasks/${taskId}_${embodimentId}.mp4`;
  }

  // ── State ─────────────────────────────────────────────────────────────────

  let activeTask = TASKS[0].id;
  let activeEmbodiment = EMBODIMENTS[0].id;

  // ── DOM helpers ───────────────────────────────────────────────────────────

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  // ── Render ────────────────────────────────────────────────────────────────

  function buildGallery() {
    const container = qs('#wacl-gallery');
    if (!container) return;

    container.innerHTML = `
      <!-- Task selector -->
      <div class="task-selector" role="group" aria-label="Select task">
        ${TASKS.map(t => `
          <button
            class="task-btn${t.id === activeTask ? ' active' : ''}"
            data-task="${t.id}"
            aria-pressed="${t.id === activeTask}"
            aria-label="Show ${t.label} task">
            ${t.label}
          </button>`).join('')}
      </div>

      <!-- Embodiment toggle -->
      <div class="embodiment-toggle">
        <div class="embodiment-toggle-inner" role="group" aria-label="Select robot embodiment">
          ${EMBODIMENTS.map(e => `
            <button
              class="embodiment-btn${e.id === activeEmbodiment ? ' active' : ''}"
              data-embodiment="${e.id}"
              aria-pressed="${e.id === activeEmbodiment}"
              aria-label="Show ${e.label} robot">
              ${e.label}
            </button>`).join('')}
        </div>
      </div>

      <!-- Unconstrained placeholder row -->
      <div class="unconstrained-row">
        <button class="unconstrained-btn" disabled aria-disabled="true" title="Unconstrained rollouts not yet recorded">
          Unconstrained (coming soon)
        </button>
        <span class="unconstrained-label">Unconstrained rollouts not yet filmed</span>
      </div>

      <!-- Video player -->
      <div class="gallery-video-wrapper visible" id="gallery-video-wrapper">
        <video
          id="gallery-video"
          autoplay
          muted
          loop
          playsinline
          preload="auto"
          aria-label="Task demonstration video">
          <source id="gallery-video-source" src="" type="video/mp4">
        </video>
      </div>

      <!-- Caption -->
      <div class="gallery-caption" id="gallery-caption">
        <div class="constraint-type" id="gallery-constraint-type"></div>
        <p class="caption-text" id="gallery-caption-text"></p>
      </div>
    `;

    updateVideoAndCaption(false);
    bindEvents(container);
  }

  function updateVideoAndCaption(animate) {
    const task = TASKS.find(t => t.id === activeTask);
    const wrapper = qs('#gallery-video-wrapper');
    const video = qs('#gallery-video');
    const source = qs('#gallery-video-source');
    const constraintEl = qs('#gallery-constraint-type');
    const captionEl = qs('#gallery-caption-text');

    if (!task || !wrapper || !video) return;

    const src = videoPath(activeTask, activeEmbodiment);

    function applyUpdate() {
      source.src = src;
      video.load();
      video.play().catch(() => {});
      constraintEl.textContent = task.constraintType;
      captionEl.textContent = task.caption;
      if (animate) {
        wrapper.classList.remove('fading');
        wrapper.classList.add('visible');
      }
    }

    if (animate) {
      wrapper.classList.remove('visible');
      wrapper.classList.add('fading');
      setTimeout(applyUpdate, 160);
    } else {
      applyUpdate();
    }
  }

  function setTask(taskId) {
    if (taskId === activeTask) return;
    activeTask = taskId;
    qsa('.task-btn').forEach(btn => {
      const active = btn.dataset.task === taskId;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    updateVideoAndCaption(true);
  }

  function setEmbodiment(embodimentId) {
    if (embodimentId === activeEmbodiment) return;
    activeEmbodiment = embodimentId;
    qsa('.embodiment-btn').forEach(btn => {
      const active = btn.dataset.embodiment === embodimentId;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    updateVideoAndCaption(true);
  }

  // ── Events ────────────────────────────────────────────────────────────────

  function bindEvents(container) {
    // Task buttons
    container.addEventListener('click', function (e) {
      const taskBtn = e.target.closest('.task-btn');
      if (taskBtn) {
        setTask(taskBtn.dataset.task);
        return;
      }
      const embodimentBtn = e.target.closest('.embodiment-btn');
      if (embodimentBtn) {
        setEmbodiment(embodimentBtn.dataset.embodiment);
      }
    });

    // Keyboard: left/right arrows to cycle tasks when a task-btn is focused
    container.addEventListener('keydown', function (e) {
      const focused = document.activeElement;
      if (!focused || !focused.classList.contains('task-btn')) return;
      const idx = TASKS.findIndex(t => t.id === focused.dataset.task);
      if (e.key === 'ArrowRight') {
        const next = TASKS[(idx + 1) % TASKS.length];
        qs(`[data-task="${next.id}"]`, container).focus();
        setTask(next.id);
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        const prev = TASKS[(idx - 1 + TASKS.length) % TASKS.length];
        qs(`[data-task="${prev.id}"]`, container).focus();
        setTask(prev.id);
        e.preventDefault();
      }
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildGallery);
  } else {
    buildGallery();
  }
})();
