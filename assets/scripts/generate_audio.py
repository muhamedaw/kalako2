"""
generate_audio.py — Synthesize the 7 Neon Party sound effects as 48 kHz / 16-bit
mono WAV files. Uses numpy + SciPy only (no external sample libs).

Run:
    python assets/scripts/generate_audio.py

Outputs (in assets/audio/):
    player_join.wav   — 0.4 s
    countdown.wav     — 0.6 s
    submit_answer.wav — 0.5 s
    vote_start.wav    — 0.7 s
    correct.wav       — 1.2 s (cyan-success semantic)
    lie_success.wav   — 1.4 s (amber-deception semantic)
    winner.wav        — 2.0 s
"""

from __future__ import annotations

import math
import sys
import wave
from pathlib import Path

# Windows cp1252 hardening for any future print with non-ASCII
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

import numpy as np
from scipy.signal import butter, lfilter

# ──────────────── output paths ───────────────────────────────────────────────
ROOT = Path(__file__).resolve().parents[1]
OUT  = ROOT / "audio"
OUT.mkdir(parents=True, exist_ok=True)

SR = 48_000        # sample rate (Hz)
PEAK_DB = -3       # peak headroom (dBFS)

# ──────────────── signal primitives ────────────────────────────────────────

def envelope(t: np.ndarray, attack=0.005, decay=0.05, sustain=0.6, release=0.1,
             total=1.0) -> np.ndarray:
    """ADSR envelope. Total time normalised — caller controls actual duration."""
    a = max(int(attack * len(t)), 1)
    d = max(int(decay  * len(t)), 1)
    s = max(int(sustain * len(t)), 1)
    r = max(len(t) - a - d - s, 1)
    env = np.concatenate([
        np.linspace(0, 1, a),
        np.linspace(1, sustain, d),
        np.full(s, sustain),
        np.linspace(sustain, 0, r),
    ])
    return env[:len(t)]


def sine(freq: float, dur: float, phase=0.0, sweep_to: float | None = None,
         sr=SR) -> np.ndarray:
    n = int(dur * sr)
    if sweep_to is None:
        t = np.linspace(0, dur, n, endpoint=False)
        return np.sin(2 * np.pi * freq * t + phase)
    # linear frequency sweep
    t = np.linspace(0, dur, n, endpoint=False)
    k = (sweep_to - freq) / dur
    phase_acc = 2 * np.pi * (freq * t + 0.5 * k * t * t)
    return np.sin(phase_acc + phase)


def triangle(freq: float, dur: float, sr=SR) -> np.ndarray:
    t = np.linspace(0, dur, int(dur * sr), endpoint=False)
    return 2 * np.abs(2 * (t * freq - np.floor(0.5 + t * freq))) - 1


def square(freq: float, dur: float, duty=0.5, sr=SR) -> np.ndarray:
    t = np.linspace(0, dur, int(dur * sr), endpoint=False)
    return np.where((t * freq) % 1 < duty, 1.0, -1.0)


def noise(dur: float, color: str = "white", sr=SR) -> np.ndarray:
    n = int(dur * sr)
    w = np.random.default_rng(int.from_bytes(b"neon", "little")).normal(0, 1, n)
    if color == "white":
        return w
    if color == "pink":
        # crude pink via Voss-McCartney averaging
        n_rows = 16
        rows = np.cumsum(np.random.default_rng(7).normal(0, 1, (n_rows, n)), axis=1)
        return (rows.sum(axis=0) / n_rows).astype(np.float32)
    if color == "brown":
        return np.cumsum(w) / 50
    return w


def lowpass(sig: np.ndarray, cutoff: float, sr=SR, order=2) -> np.ndarray:
    b, a = butter(order, cutoff / (sr / 2), btype="low")
    return lfilter(b, a, sig).astype(np.float32)


def reverb(sig: np.ndarray, decay_s: float = 0.4, sr=SR) -> np.ndarray:
    """Simple feed-forward reverb built from decaying noise IR."""
    ir_len = int(decay_s * sr)
    rng = np.random.default_rng(int.from_bytes(b"revr", "little"))
    ir = rng.normal(0, 1, ir_len).astype(np.float32)
    ir *= np.exp(-np.linspace(0, decay_s * 6, ir_len))
    wet = np.convolve(sig, ir, mode="full")[:len(sig) + ir_len // 2]
    wet = wet[:len(sig)]
    return wet.astype(np.float32) * 0.35


# ──────────────── effect definitions ───────────────────────────────────────

def sfx_player_join() -> np.ndarray:
    dur = 0.4
    t = np.linspace(0, dur, int(dur * SR), endpoint=False)
    # upward sweep 440→880, with subtle harmonic
    s1 = sine(440, dur, sweep_to=880, sr=SR)
    s2 = sine(880, dur, sweep_to=1760, sr=SR) * 0.4
    s3 = noise(0.06, "white") * 0.3
    s  = s1 + s2 + np.concatenate([s3, np.zeros(int(dur*SR)-len(s3))])
    env = envelope(t, attack=0.01, decay=0.18, sustain=0.0, release=0.05, total=dur)
    return s * env


def sfx_countdown() -> np.ndarray:
    dur = 0.6
    t = np.linspace(0, dur, int(dur * SR), endpoint=False)
    # three short blip layers evoking a quick "tick"
    blip_w = 0.06
    s = np.zeros_like(t)
    for t0 in (0.0, 0.15, 0.32):
        n0 = int(t0 * SR)
        n1 = n0 + int(blip_w * SR)
        s[n0:n1] += (triangle(880, blip_w, sr=SR) +
                     sine(2640, blip_w, sr=SR) * 0.25)
    env = envelope(t, attack=0.005, decay=0.4, sustain=0.0, release=0.15, total=dur)
    return s * env


def sfx_submit_answer() -> np.ndarray:
    dur = 0.5
    t = np.linspace(0, dur, int(dur * SR), endpoint=False)
    # bouncy two-note pluck — C then G
    n_half = len(t) // 2
    base1 = triangle(523.25, dur/2, sr=SR)          # C5
    base2 = triangle(783.99, dur/2, sr=SR)          # G5
    sub1  = sine(130.81, dur/2, sr=SR) * 0.4        # C3 sub
    sub2  = sine(196.00, dur/2, sr=SR) * 0.4        # G3
    s = np.concatenate([base1 + sub1, base2 + sub2])
    env = envelope(t, attack=0.005, decay=0.15, sustain=0.5, release=0.2, total=dur)
    return s * env


def sfx_vote_start() -> np.ndarray:
    dur = 0.7
    t = np.linspace(0, dur, int(dur * SR), endpoint=False)
    s_click = noise(0.02, "white") * np.exp(-np.linspace(0, 30, int(0.02*SR)))
    s_thump = sine(70, 0.25, sr=SR) * np.linspace(1, 0, int(0.25*SR))
    s_chime = sine(1320, dur, sr=SR) * 0.25
    body = np.zeros_like(t)
    body[:len(s_click)] += s_click
    body[:len(s_thump)] += s_thump
    body[-len(s_chime):] += s_chime
    env = envelope(t, attack=0.002, decay=0.5, sustain=0.0, release=0.2, total=dur)
    return body * env


def sfx_correct() -> np.ndarray:
    """Cheery 3-note arpeggio C–E–G with piano-like quick decay + cyan vibe high partial."""
    dur = 1.2
    t = np.linspace(0, dur, int(dur * SR), endpoint=False)
    notes = [(523.25, 0.0, 0.30),  # C5
             (659.25, 0.18, 0.30), # E5
             (783.99, 0.36, 0.55), # G5
             (1046.5, 0.50, 0.60)] # C6
    s = np.zeros_like(t)
    for f, t0, d in notes:
        n0 = int(t0 * SR); n1 = n0 + int(d * SR)
        tone = (sine(f, d, sr=SR) +
                triangle(2*f, d, sr=SR) * 0.3 +
                sine(3*f, d, sr=SR) * 0.1)
        decay = np.exp(-np.linspace(0, 8, n1 - n0))
        s[n0:n1] += tone * decay
    s += triangle(2093, dur, sr=SR) * 0.10  # C7 sparkle throughout
    env = envelope(t, attack=0.005, decay=0.25, sustain=0.5, release=0.4, total=dur)
    return (s * env) * 0.9 + reverb(s * env, decay_s=0.25) * 0.15


def sfx_lie_success() -> np.ndarray:
    """Sneaky descending 'wub' + slight slide whistle over amber undertone."""
    dur = 1.4
    t = np.linspace(0, dur, int(dur * SR), endpoint=False)
    # descending wub: 330 → 110 with frequency modulation
    f0, f1 = 330.0, 110.0
    n = len(t)
    f = f0 + (f1 - f0) * (t/dur)                      # linear freq descent
    phase = 2*np.pi*np.cumsum(f)/SR
    body  = np.sin(phase) + np.sin(2*phase)*0.4 + np.sin(0.5*phase)*0.3
    # slide whistle — quick upward chirp at the tail
    chirp_t = np.linspace(0, 0.4, int(0.4*SR), endpoint=False)
    chirp   = sine(900, 0.4, sweep_to=1800, sr=SR) * np.linspace(1, 0, len(chirp_t))
    s = np.zeros_like(t)
    s[:] = body
    s[-len(chirp):] += chirp * 0.6
    # amber undertone layer
    s += sine(110, dur, sr=SR) * 0.35 * np.linspace(0.6, 0, n)
    env = envelope(t, attack=0.005, decay=0.2, sustain=0.7, release=0.3, total=dur)
    return s * env


def sfx_winner() -> np.ndarray:
    """Brassy 4-note fanfare C–E–G–C with high partials, reverb tail."""
    dur = 2.0
    t = np.linspace(0, dur, int(dur * SR), endpoint=False)
    notes = [(523.25, 0.0,  0.40),   # C5
             (659.25, 0.10, 0.40),   # E5
             (783.99, 0.20, 0.45),   # G5
             (1046.5, 0.30, 1.20)]   # C6 sustained
    s = np.zeros_like(t)
    for f, t0, d in notes:
        n0 = int(t0 * SR); n1 = n0 + int(d * SR)
        # brass-like = sawtooth via additive sine series
        partials = sum(sine(k*f, d, sr=SR) / k for k in range(1, 9))
        decay = np.exp(-np.linspace(0, 2.5, n1 - n0))
        s[n0:n1] += (partials * decay) * 0.5
        # sub octave for weight
        if f < 800:
            s[n0:n1] += sine(f*0.5, d, sr=SR) * np.linspace(1, 0.4, n1 - n0) * 0.6
    # cymbal hit on the final C
    n0 = int(0.30 * SR); n1 = int(0.50 * SR)
    s[n0:n1] += noise(0.20, "white") * np.exp(-np.linspace(0, 25, n1-n0)) * 0.6
    # reverb tail
    s = s + reverb(s, decay_s=0.5) * 0.25
    env = envelope(t, attack=0.005, decay=0.2, sustain=0.7, release=0.6, total=dur)
    return s * env


# ──────────────── WAV writer ─────────────────────────────────────────────────

def write_wav(name: str, sig: np.ndarray) -> Path:
    """Write 16-bit mono WAV. Peak normalised to PEAK_DB."""
    sig = sig.astype(np.float32)
    peak = float(np.max(np.abs(sig))) or 1.0
    target = 10 ** (PEAK_DB / 20)
    sig = sig * (target / peak)
    pcm = (np.clip(sig, -1, 1) * 32767).astype(np.int16)
    out = OUT / name
    with wave.open(str(out), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    size_kb = len(pcm.tobytes()) // 1024
    print(f"  wrote  {out.relative_to(ROOT)}  ({len(pcm)/SR:.2f}s, {size_kb} kB)")
    return out


# ──────────────── driver ────────────────────────────────────────────────────

EFFECTS = [
    ("player_join.wav",   sfx_player_join),
    ("countdown.wav",     sfx_countdown),
    ("submit_answer.wav", sfx_submit_answer),
    ("vote_start.wav",    sfx_vote_start),
    ("correct.wav",       sfx_correct),
    ("lie_success.wav",   sfx_lie_success),
    ("winner.wav",        sfx_winner),
]

def main():
    np.random.seed(42)
    print(f"Generating Neon Party SFX -> {OUT}")
    for name, fn in EFFECTS:
        sig = fn()
        write_wav(name, sig)
    print("[Done] 7 SFX generated.")


if __name__ == "__main__":
    main()
