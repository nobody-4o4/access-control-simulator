"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  Lock,
  Unlock,
  User,
  Key,
  History,
  Bell,
  Sword,
  ArrowLeft,
  CheckCircle,
  MapPin,
  Download,
  Trash2,
  BarChart3,
} from "lucide-react";

import { useRouter, usePathname } from "next/navigation";

export default function AccessControlSimulator() {
  const router = useRouter();
  const pathname = usePathname();

  // If we're on /syscontrol, start with access-control view, otherwise building
  const [currentView, setCurrentView] = useState(
    pathname === "/syscontrol" ? "access-control" : "building"
  );
  const [accessCode, setAccessCode] = useState("");
  const [badgeId, setBadgeId] = useState("");
  const [fingerprint, setFingerprint] = useState("");
  const [attempts, setAttempts] = useState(0);
  // Load accessLog from localStorage on mount
  const [accessLog, setAccessLog] = useState<
    Array<{
      timestamp: string;
      type: string;
      message: string;
      success: boolean;
    }>
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("accessControlLogs");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });
  const [isLocked, setIsLocked] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [simpleModeChoice, setSimpleModeChoice] = useState<"PIN" | "BADGE">(
    "PIN"
  );
  const [defensesEnabled, setDefensesEnabled] = useState(false);
  const [showAttackPanel, setShowAttackPanel] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);
  const [alarmAudio, setAlarmAudio] = useState<HTMLAudioElement | null>(null);
  const [foundPinPopup, setFoundPinPopup] = useState<{
    show: boolean;
    pin: string;
  }>({ show: false, pin: "" });
  const [bruteForceInterval, setBruteForceInterval] =
    useState<NodeJS.Timeout | null>(null);

  const [pinValidated, setPinValidated] = useState(false);
  const [showSocialEngineeringModal, setShowSocialEngineeringModal] =
    useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [showBypassModal, setShowBypassModal] = useState(false);
  const [currentBypassPhase, setCurrentBypassPhase] = useState(0);
  const [showTerminalDemo, setShowTerminalDemo] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [terminalCommandIndex, setTerminalCommandIndex] = useState(0);

  useEffect(() => {
    const audio = new Audio(
      "/music/ALERT WARNING SOUND EFFECT _ NO COPYRIGHT.mp3"
    );
    audio.loop = true;
    setAlarmAudio(audio);
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Update view when pathname changes
  useEffect(() => {
    if (pathname === "/syscontrol") {
      setCurrentView("access-control");
    } else if (pathname === "/") {
      setCurrentView("building");
    }
  }, [pathname]);

  // Terminal demo simulation
  useEffect(() => {
    if (!showTerminalDemo) {
      setTerminalOutput([]);
      setTerminalCommandIndex(0);
      return;
    }

    const commands = [
      {
        cmd: "nmap -p 23 192.168.1.100",
        output:
          "PORT     STATE SERVICE\n23/tcp   open  telnet\nMAC Address: 00:1A:2B:3C:4D:5E",
      },
      {
        cmd: "telnet 192.168.1.100 23",
        output:
          "Trying 192.168.1.100...\nConnected to 192.168.1.100.\nEscape character is '^]'.",
      },
      {
        cmd: "admin",
        output: "Login successful.\nWelcome to Access Control System v2.1.3",
      },
      { cmd: "admin", output: "Password accepted.\n# " },
      {
        cmd: "show config",
        output:
          "Access Control Configuration:\n- PIN Codes: [REDACTED]\n- Badge IDs: [REDACTED]\n- Security Level: Standard",
      },
      {
        cmd: "disable_alarm",
        output: "Alarm system disabled.\nWarning: This action is logged.",
      },
      {
        cmd: "create_admin_badge BADGE999",
        output: "Admin badge created: BADGE999\nPrivileges: Full Access",
      },
      {
        cmd: "clear_logs",
        output: "Access logs cleared.\nSystem logs cleared.",
      },
      { cmd: "exit", output: "Connection closed by foreign host." },
    ];

    if (terminalCommandIndex < commands.length) {
      const timer = setTimeout(
        () => {
          const currentCommand = commands[terminalCommandIndex];
          setTerminalOutput((prev) => [
            ...prev,
            `$ ${currentCommand.cmd}`,
            currentCommand.output,
          ]);
          setTerminalCommandIndex((prev) => prev + 1);
        },
        terminalCommandIndex === 0 ? 500 : 2000
      );

      return () => clearTimeout(timer);
    }
  }, [showTerminalDemo, terminalCommandIndex]);

  // Save accessLog to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessControlLogs", JSON.stringify(accessLog));
    }
  }, [accessLog]);

  // Système de défense
  const VALID_CODES = ["1234", "5678", "9999"];
  const VALID_BADGES = ["BADGE001", "BADGE002", "BADGE003"];
  const VALID_PINS_SIMPLE = ["1234", "5678", "9999"];
  const VALID_FINGERPRINTS = ["FP001", "FP002", "FP003"];
  const MAX_ATTEMPTS = 3;

  const addLog = (type: string, message: string, success: boolean) => {
    const timestamp = new Date().toLocaleTimeString();
    setAccessLog((prev) =>
      [{ timestamp, type, message, success }, ...prev].slice(0, 10)
    );
  };

  const clearLogs = (filterType: string) => {
    if (filterType === "access") {
      setAccessLog((prev) => {
        const filtered = prev.filter(
          (log) =>
            log.type !== "Accès" &&
            log.type !== "Tentative" &&
            log.type !== "Système"
        );
        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("accessControlLogs", JSON.stringify(filtered));
        }
        return filtered;
      });
    } else if (filterType === "security") {
      setAccessLog((prev) => {
        const filtered = prev.filter(
          (log) => log.type !== "Sécurité" && log.type !== "Défense"
        );
        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("accessControlLogs", JSON.stringify(filtered));
        }
        return filtered;
      });
    } else if (filterType === "attack") {
      setAccessLog((prev) => {
        const filtered = prev.filter((log) => log.type !== "Attaque");
        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("accessControlLogs", JSON.stringify(filtered));
        }
        return filtered;
      });
    }
  };

  const downloadLogs = (filterType: string, cardName: string) => {
    let filteredLogs: typeof accessLog = [];
    if (filterType === "access") {
      filteredLogs = accessLog.filter(
        (log) =>
          log.type === "Accès" ||
          log.type === "Tentative" ||
          log.type === "Système"
      );
    } else if (filterType === "security") {
      filteredLogs = accessLog.filter(
        (log) => log.type === "Sécurité" || log.type === "Défense"
      );
    } else if (filterType === "attack") {
      filteredLogs = accessLog.filter((log) => log.type === "Attaque");
    } else {
      filteredLogs = [];
    }

    const csvContent = [
      ["Timestamp", "Type", "Message", "Success"],
      ...filteredLogs.map((log) => [
        log.timestamp,
        log.type,
        log.message,
        log.success ? "Oui" : "Non",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${cardName}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadStatistics = () => {
    const totalEvents = accessLog.length;
    const accessCount = accessLog.filter((log) => log.type === "Accès").length;
    const accessSuccess = accessLog.filter(
      (log) => log.type === "Accès" && log.success
    ).length;
    const attemptsCount = accessLog.filter(
      (log) => log.type === "Tentative"
    ).length;
    const attemptsFailed = accessLog.filter(
      (log) => log.type === "Tentative" && !log.success
    ).length;
    const attacksCount = accessLog.filter(
      (log) => log.type === "Attaque"
    ).length;
    const attacksBlocked = accessLog.filter(
      (log) => log.type === "Attaque" && !log.success
    ).length;
    const defenseCount = accessLog.filter(
      (log) => log.type === "Défense"
    ).length;
    const defenseDetections = accessLog.filter(
      (log) => log.type === "Défense" && log.success
    ).length;
    const securityAlerts = accessLog.filter(
      (log) => log.type === "Sécurité" || log.type === "Défense"
    ).length;
    const successRate =
      accessLog.length > 0
        ? Math.round(
            (accessLog.filter((log) => log.success).length / accessLog.length) *
              100
          )
        : 0;

    const csvContent = [
      ["Statistique", "Valeur"],
      ["Total des événements", totalEvents.toString()],
      ["Accès", accessCount.toString()],
      ["Accès réussis", accessSuccess.toString()],
      ["Tentatives", attemptsCount.toString()],
      ["Tentatives échouées", attemptsFailed.toString()],
      ["Attaques", attacksCount.toString()],
      ["Attaques bloquées", attacksBlocked.toString()],
      ["Défense", defenseCount.toString()],
      ["Détections de défense", defenseDetections.toString()],
      ["Alertes de Sécurité", securityAlerts.toString()],
      ["Taux de succès (%)", successRate.toString()],
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Statistiques_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetSystem = () => {
    setIsLocked(false);
    setAttempts(0);
    setShowAlert(false);
    setShowAlarm(false);
    setFoundPinPopup({ show: false, pin: "" });
    setPinValidated(false); // Reset pin validation state
    setSimpleModeChoice("PIN"); // Reset to PIN mode
    // Clear any running brute force interval
    if (bruteForceInterval) {
      clearInterval(bruteForceInterval);
      setBruteForceInterval(null);
    }
    if (alarmAudio) {
      alarmAudio.pause();
      alarmAudio.currentTime = 0;
    }
  };

  const triggerAlarm = (message: string) => {
    setShowAlarm(true);
    if (alarmAudio && defensesEnabled) {
      alarmAudio.play().catch((e) => console.error("Audio play failed:", e));
    }
    addLog("Sécurité", `🚨 ALERTE INTRUSION: ${message}`, false);

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      setShowAlarm(false);
      if (alarmAudio) {
        alarmAudio.pause();
        alarmAudio.currentTime = 0;
      }
    }, 10000);
  };

  const handleAuth = (type: "pin" | "badge") => {
    if (defensesEnabled) {
      if (type === "pin") {
        const pinValid = VALID_PINS_SIMPLE.includes(accessCode);
        if (pinValid) {
          setPinValidated(true);
          addLog(
            "Accès",
            "✓ Code PIN validé - Veuillez scanner votre badge",
            true
          );
          setAccessCode("");
          setSimpleModeChoice("BADGE");
        } else {
          addLog("Tentative", "✗ Code PIN incorrect - Accès refusé", false);
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          if (newAttempts >= MAX_ATTEMPTS) {
            setIsLocked(true);
            setShowAlert(true);
            triggerAlarm("Nombre maximum de tentatives atteint");
          }
        }
      } else if (type === "badge") {
        // Check if badge is cloned (ends with _CLONE)
        const isClonedBadge = badgeId.endsWith("_CLONE");

        if (isClonedBadge) {
          // Cloned badge detected - trigger alarm and block access
          triggerAlarm(`Badge cloné détecté: ${badgeId}`);
          addLog(
            "Défense",
            `🛡️ Badge cloné ${badgeId} détecté et refusé`,
            true
          );
          setBadgeId("");
          setPinValidated(false);
          setSimpleModeChoice("PIN");
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          if (newAttempts >= MAX_ATTEMPTS) {
            setIsLocked(true);
            setShowAlert(true);
            triggerAlarm(
              "Badge cloné détecté - Tentatives multiples détectées"
            );
          }
        } else {
          const badgeValid = VALID_BADGES.includes(badgeId);
          if (badgeValid) {
            addLog(
              "Accès",
              "✓ Double authentification réussie - Accès autorisé",
              true
            );
            setBadgeId("");
            setPinValidated(false);
            setAttempts(0);
            router.push("/welcome");
          } else {
            addLog("Tentative", "✗ Badge invalide - Accès refusé", false);
            setPinValidated(false);
            setSimpleModeChoice("PIN");
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            if (newAttempts >= MAX_ATTEMPTS) {
              setIsLocked(true);
              setShowAlert(true);
              triggerAlarm("Badge invalide - Tentatives multiples détectées");
            }
          }
        }
      }
    } else {
      if (type === "pin") {
        const pinValid = VALID_PINS_SIMPLE.includes(accessCode);
        if (pinValid) {
          addLog("Accès", "✓ Code PIN correct - Accès autorisé", true);
          setAccessCode("");
          router.push("/welcome");
        } else {
          addLog("Tentative", "✗ Code PIN incorrect - Accès refusé", false);
        }
      } else if (type === "badge") {
        // Check if badge is cloned (ends with _CLONE)
        const isClonedBadge = badgeId.endsWith("_CLONE");

        if (isClonedBadge) {
          // Extract base badge ID (remove _CLONE suffix)
          const baseBadgeId = badgeId.replace("_CLONE", "");
          const baseBadgeValid = VALID_BADGES.includes(baseBadgeId);

          if (baseBadgeValid) {
            // Cloned badge works when defense is disabled
            addLog(
              "Accès",
              `✓ Badge cloné ${badgeId} accepté (défense désactivée) - Accès autorisé`,
              true
            );
            setBadgeId("");
            router.push("/welcome");
          } else {
            addLog("Tentative", "✗ Badge cloné invalide - Accès refusé", false);
          }
        } else {
          const badgeValid = VALID_BADGES.includes(badgeId);
          if (badgeValid) {
            addLog("Accès", "✓ Badge valide - Accès autorisé", true);
            setBadgeId("");
            router.push("/welcome");
          } else {
            addLog("Tentative", "✗ Badge invalide - Accès refusé", false);
          }
        }
      }
    }
  };

  const handleAccessAttempt = () => {
    if (defensesEnabled && isLocked) {
      setShowAlert(true);
      addLog("Tentative", "Système verrouillé - Accès refusé", false);
      triggerAlarm("Tentative d'accès sur système verrouillé");
      return;
    }

    if (defensesEnabled) {
      // Step 1: Validate PIN first
      if (simpleModeChoice === "PIN" && !pinValidated) {
        handleAuth("pin");
        return;
      }

      // Step 2: Validate Badge after PIN
      if (simpleModeChoice === "BADGE" && pinValidated) {
        handleAuth("badge");
        return;
      }

      // If somehow we get here without following the flow, reset
      if (simpleModeChoice === "BADGE" && !pinValidated) {
        addLog("Tentative", "⚠️ Veuillez d'abord entrer votre code PIN", false);
        setSimpleModeChoice("PIN");
        return;
      }
    } else {
      // Simple mode access attempt
      if (simpleModeChoice === "PIN") {
        handleAuth("pin");
      } else {
        handleAuth("badge");
      }
    }
  };

  const simulateAttack = (type: string) => {
    switch (type) {
      case "brute-force":
        // Clear any existing brute force interval
        if (bruteForceInterval) {
          clearInterval(bruteForceInterval);
          setBruteForceInterval(null);
        }

        addLog("Attaque", "⚔️ Tentative de Brute Force détectée", false);

        let attemptCount = 0;
        let foundValidPin = false;
        const bruteForceList = [
          "0000",
          "1111",
          "2222",
          "3333",
          "4444",
          "5555",
          "6666",
          "7777",
          "8888",
          "1357",
          "2468",
          "9876",
          "4321",
          "7890",
          "1234", // Valid PINs at the end
          "5678",
          "9999",
        ];
        let currentIndex = 0;

        const bruteInterval = setInterval(() => {
          attemptCount++;
          const testCode =
            bruteForceList[currentIndex] ||
            Math.floor(Math.random() * 10000)
              .toString()
              .padStart(4, "0");
          currentIndex++;

          setAccessCode(testCode);
          addLog("Attaque", `Test du code PIN: ${testCode}`, false);

          // Defense mode: Block after 3 attempts
          if (defensesEnabled && attemptCount >= MAX_ATTEMPTS) {
            foundValidPin = false;
            clearInterval(bruteInterval);
            setBruteForceInterval(null);
            setIsLocked(true);
            triggerAlarm(
              "Attaque Brute Force bloquée - Système verrouillé après 3 tentatives"
            );
            addLog(
              "Défense",
              `🛡️ Brute Force bloqué après ${MAX_ATTEMPTS} tentatives - Système verrouillé`,
              true
            );
            setAccessCode("");
            return;
          }

          // Check if the code is valid
          if (VALID_PINS_SIMPLE.includes(testCode)) {
            foundValidPin = true;
            clearInterval(bruteInterval);
            setBruteForceInterval(null);
            setAccessCode("");

            if (defensesEnabled) {
              // Defense enabled: Block and alarm
              setIsLocked(true);
              triggerAlarm(`Brute Force a identifié le PIN: ${testCode}`);
              addLog(
                "Défense",
                "🛡️ Brute Force détecté - Système verrouillé",
                true
              );
            } else {
              // Defense disabled: Show popup with found PIN and stop
              addLog("Attaque", `✓ PIN valide trouvé: ${testCode}`, true);
              setFoundPinPopup({ show: true, pin: testCode });
            }
          } else if (currentIndex >= bruteForceList.length && !foundValidPin) {
            // No valid PIN found in the list
            clearInterval(bruteInterval);
            setBruteForceInterval(null);
            setAccessCode("");
            if (defensesEnabled) {
              setIsLocked(true);
              addLog(
                "Défense",
                "🛡️ Brute Force bloqué - Système verrouillé",
                true
              );
            } else {
              addLog(
                "Attaque",
                "⚠️ Brute Force échoué - PIN non trouvé",
                false
              );
            }
          }
        }, 500);

        setBruteForceInterval(bruteInterval);
        break;

      case "badge-clone":
        const clonedBadge = "BADGE001_CLONE";
        addLog(
          "Attaque",
          `⚔️ Tentative de clonage de badge: ${clonedBadge}`,
          false
        );
        setBadgeId(clonedBadge);
        if (defensesEnabled) {
          addLog(
            "Attaque",
            `⚠️ Badge cloné ${clonedBadge} créé - Le système de défense détectera l'utilisation`,
            false
          );
        } else {
          addLog(
            "Attaque",
            `⚠️ Badge cloné ${clonedBadge} créé - Le système de défense est désactivé`,
            false
          );
        }
        break;

      case "social-engineering":
        // Open the detailed social engineering scenario modal
        setShowSocialEngineeringModal(true);
        setCurrentPhase(0);
        addLog(
          "Attaque",
          "⚔️ SCÉNARIO: L'attaque du 'Technicien IT' - Ingénierie Sociale",
          false
        );
        break;

      case "bypass":
        // Open the detailed bypass system scenario modal
        setShowBypassModal(true);
        setCurrentBypassPhase(0);
        addLog(
          "Attaque",
          "⚔️ SCÉNARIO: Bypass Système - Contournement des contrôles d'accès",
          false
        );
        break;
    }
  };

  const handleNumberPad = (value: string) => {
    if (value === "C") {
      setAccessCode("");
    } else if (value === "←") {
      setAccessCode(accessCode.slice(0, -1));
    } else if (accessCode.length < 4) {
      setAccessCode(accessCode + value);
    }
  };

  const [hoveredWindow, setHoveredWindow] = useState<string | null>(null);
  const [doorHovered, setDoorHovered] = useState(false);
  const [cloudPosition, setCloudPosition] = useState(0);
  const [isNightMode, setIsNightMode] = useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCloudPosition((prev) => (prev + 0.5) % 450);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  if (currentView === "building") {
    return (
      <div
        className={`w-full min-h-screen h-screen flex items-center justify-center overflow-hidden transition-all duration-1000 ${
          isNightMode
            ? "bg-gradient-to-b from-gray-900 via-blue-900 to-indigo-900"
            : "bg-gradient-to-b from-sky-400 via-blue-300 to-blue-200"
        }`}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Day/Night Toggle Button */}
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className="fixed top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 z-50 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 sm:p-3 md:p-4 lg:p-5 transition-all transform hover:scale-110 shadow-2xl"
            title={isNightMode ? "Passer au jour" : "Passer à la nuit"}
          >
            {isNightMode ? (
              <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                ☀️
              </span>
            ) : (
              <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                🌙
              </span>
            )}
          </button>

          <svg
            viewBox="0 0 500 450"
            className="w-full h-full max-w-full max-h-full drop-shadow-2xl"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Sky/Night Sky */}
            <defs>
              <radialGradient id="nightGradient" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#1a1a2e" />
                <stop offset="100%" stopColor="#0f0f1e" />
              </radialGradient>
            </defs>

            {isNightMode ? (
              <>
                {/* Night Sky with Stars */}
                <rect
                  x="0"
                  y="0"
                  width="500"
                  height="450"
                  fill="url(#nightGradient)"
                />
                {[...Array(50)].map((_, i) => (
                  <circle
                    key={i}
                    cx={Math.random() * 500}
                    cy={Math.random() * 300}
                    r={Math.random() * 2}
                    fill="white"
                    opacity="0.3 + Math.random() * 0.7"
                  >
                    <animate
                      attributeName="opacity"
                      values={`${0.3 + Math.random() * 0.7};${
                        Math.random() * 0.3
                      };${0.3 + Math.random() * 0.7}`}
                      dur={`${2 + Math.random()}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                ))}
                {/* Moon */}
                <circle cx="420" cy="60" r="35" fill="#f4e5c3" opacity="0.9">
                  <animate
                    attributeName="opacity"
                    values="0.9;0.95;0.9"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </circle>
                {/* Moon craters */}
                <circle cx="410" cy="55" r="5" fill="#d4c5a3" opacity="0.5" />
                <circle cx="425" cy="65" r="7" fill="#d4c5a3" opacity="0.5" />
                <circle cx="415" cy="70" r="4" fill="#d4c5a3" opacity="0.5" />
              </>
            ) : (
              <>
                {/* Animated Clouds */}
                <g
                  style={{ transform: `translateX(${cloudPosition - 100}px)` }}
                >
                  <ellipse
                    cx="80"
                    cy="60"
                    rx="25"
                    ry="15"
                    fill="white"
                    opacity="0.8"
                  />
                  <ellipse
                    cx="95"
                    cy="55"
                    rx="30"
                    ry="18"
                    fill="white"
                    opacity="0.8"
                  />
                  <ellipse
                    cx="110"
                    cy="60"
                    rx="25"
                    ry="15"
                    fill="white"
                    opacity="0.8"
                  />
                </g>
                <g
                  style={{ transform: `translateX(${cloudPosition - 200}px)` }}
                >
                  <ellipse
                    cx="350"
                    cy="80"
                    rx="30"
                    ry="18"
                    fill="white"
                    opacity="0.7"
                  />
                  <ellipse
                    cx="370"
                    cy="75"
                    rx="35"
                    ry="20"
                    fill="white"
                    opacity="0.7"
                  />
                  <ellipse
                    cx="390"
                    cy="80"
                    rx="30"
                    ry="18"
                    fill="white"
                    opacity="0.7"
                  />
                </g>

                {/* Sun */}
                <circle cx="420" cy="50" r="30" fill="#ffd700" opacity="0.9">
                  <animate
                    attributeName="r"
                    values="30;32;30"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                  <line
                    key={i}
                    x1="420"
                    y1="50"
                    x2={420 + Math.cos((angle * Math.PI) / 180) * 45}
                    y2={50 + Math.sin((angle * Math.PI) / 180) * 45}
                    stroke="#ffd700"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                ))}
              </>
            )}

            {/* Background buildings - more detailed */}
            <rect
              x="30"
              y="200"
              width="70"
              height="160"
              fill={isNightMode ? "#2c3e50" : "#5a7a9f"}
              rx="5"
            />
            {[210, 230, 250, 270, 290].map((y) => (
              <rect
                key={y}
                x="40"
                y={y}
                width="20"
                height="15"
                fill={isNightMode ? "#f39c12" : "#87ceeb"}
                stroke="#2c3e50"
                strokeWidth="1"
              >
                {isNightMode && (
                  <animate
                    attributeName="opacity"
                    values="1;0.7;1"
                    dur={`${2 + Math.random()}s`}
                    repeatCount="indefinite"
                  />
                )}
              </rect>
            ))}

            <rect
              x="400"
              y="180"
              width="70"
              height="180"
              fill={isNightMode ? "#2c3e50" : "#5a7a9f"}
              rx="5"
              style={{ display: "flex", flexWrap: "wrap" }}
            />
            {[190, 210, 230, 250, 270, 290].map((y) => (
              <rect
                key={y}
                x="410"
                y={y}
                width="20"
                height="15"
                fill={isNightMode ? "#f39c12" : "#87ceeb"}
                stroke="#2c3e50"
                strokeWidth="1"
              >
                {isNightMode && (
                  <animate
                    attributeName="opacity"
                    values="1;0.6;1"
                    dur={`${1.5 + Math.random()}s`}
                    repeatCount="indefinite"
                  />
                )}
              </rect>
            ))}

            {/* Main building */}
            <rect
              x="150"
              y="100"
              width="200"
              height="260"
              fill="#ff9f4a"
              stroke="#2c3e50"
              strokeWidth="5"
              rx="8"
            />

            {/* Building shadow */}
            <rect
              x="155"
              y="105"
              width="190"
              height="250"
              fill="black"
              opacity="0.1"
              rx="8"
            />

            {/* Roof with antenna */}
            <rect
              x="135"
              y="75"
              width="230"
              height="30"
              fill="#2c3e50"
              rx="5"
            />
            <rect x="245" y="55" width="10" height="25" fill="#34495e" />
            <circle cx="250" cy="52" r="5" fill="#e74c3c">
              <animate
                attributeName="opacity"
                values="1;0.3;1"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Air conditioning units */}
            <rect x="165" y="85" width="20" height="10" fill="#7f8c8d" rx="2" />
            <rect x="315" y="85" width="20" height="10" fill="#7f8c8d" rx="2" />

            {/* Windows - Interactive */}
            {[
              { floor: 120, windows: [170, 230, 290] },
              { floor: 160, windows: [170, 230, 290] },
              { floor: 200, windows: [170, 230, 290] },
              { floor: 240, windows: [170, 230, 290] },
              { floor: 280, windows: [170, 290] },
            ].map((floor, floorIdx) => (
              <g key={floorIdx}>
                {floor.windows.map((x, winIdx) => {
                  const windowId = `${floorIdx}-${winIdx}`;
                  const isHovered = hoveredWindow === windowId;
                  const windowColor = isNightMode
                    ? isHovered
                      ? "#ffd700"
                      : "#f39c12"
                    : isHovered
                    ? "#ffd700"
                    : "#87ceeb";
                  return (
                    <g
                      key={windowId}
                      onMouseEnter={() => setHoveredWindow(windowId)}
                      onMouseLeave={() => setHoveredWindow(null)}
                      className="cursor-pointer transition-all"
                    >
                      <rect
                        x={x}
                        y={floor.floor}
                        width="35"
                        height="30"
                        fill={windowColor}
                        stroke="#2c3e50"
                        strokeWidth="3"
                        rx="3"
                      >
                        {isNightMode && !isHovered && (
                          <animate
                            attributeName="opacity"
                            values="1;0.8;1"
                            dur={`${2 + Math.random()}s`}
                            repeatCount="indefinite"
                          />
                        )}
                        {isHovered && (
                          <animate
                            attributeName="fill"
                            values={`${windowColor};#ffd700;${windowColor}`}
                            dur="0.5s"
                            repeatCount="1"
                          />
                        )}
                      </rect>
                      <line
                        x1={x + 17.5}
                        y1={floor.floor}
                        x2={x + 17.5}
                        y2={floor.floor + 30}
                        stroke="#2c3e50"
                        strokeWidth="2"
                      />
                      <line
                        x1={x}
                        y1={floor.floor + 15}
                        x2={x + 35}
                        y2={floor.floor + 15}
                        stroke="#2c3e50"
                        strokeWidth="2"
                      />

                      {/* Window curtain */}
                      {!isHovered && !isNightMode && (
                        <rect
                          x={x + 2}
                          y={floor.floor + 2}
                          width="15"
                          height="26"
                          fill="#e67e22"
                          opacity="0.3"
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            ))}

            {/* Security camera */}
            <g>
              <rect
                x="330"
                y="110"
                width="12"
                height="8"
                fill="#2c3e50"
                rx="2"
              />
              <circle cx="336" cy="114" r="3" fill="#e74c3c">
                <animate
                  attributeName="opacity"
                  values="1;0.5;1"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>

            {/* Main entrance decoration */}
            <rect
              x="220"
              y="310"
              width="60"
              height="45"
              fill="#c0392b"
              stroke="#2c3e50"
              strokeWidth="4"
              rx="5"
            />

            {/* Door - Interactive with glow effect */}
            <g
              onMouseEnter={() => setDoorHovered(true)}
              onMouseLeave={() => setDoorHovered(false)}
              onClick={() => {
                // If we're on the home page (/), redirect to /syscontrol
                // Otherwise, just change the view
                if (pathname === "/") {
                  router.push("/syscontrol");
                } else {
                  setCurrentView("access-control");
                }
              }}
              className="cursor-pointer"
            >
              {doorHovered && (
                <rect
                  x="230"
                  y="320"
                  width="40"
                  height="35"
                  fill="#ffd700"
                  opacity="0.5"
                  rx="3"
                  className="animate-pulse"
                />
              )}
              <rect
                x="230"
                y="320"
                width="40"
                height="35"
                fill={doorHovered ? "#e74c3c" : "#c0392b"}
                stroke={doorHovered ? "#ffd700" : "#2c3e50"}
                strokeWidth={doorHovered ? "4" : "3"}
                rx="3"
              >
                {doorHovered && (
                  <animate
                    attributeName="fill"
                    values="#c0392b;#e74c3c;#c0392b"
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                )}
              </rect>

              {/* Door handle */}
              <circle cx="265" cy="337" r="3" fill="#ffd700">
                {doorHovered && (
                  <animate
                    attributeName="r"
                    values="3;4;3"
                    dur="0.5s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>

              {/* Door lines */}
              <line
                x1="250"
                y1="320"
                x2="250"
                y2="355"
                stroke="#2c3e50"
                strokeWidth="2"
              />

              {/* Security keypad */}
              <rect
                x="235"
                y="325"
                width="8"
                height="12"
                fill="#34495e"
                rx="1"
              />
              <rect
                x="236"
                y="326"
                width="6"
                height="4"
                fill="#27ae60"
                opacity="0.8"
              >
                <animate
                  attributeName="opacity"
                  values="0.8;0.3;0.8"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </rect>
            </g>

            {/* Entrance steps */}
            <rect x="215" y="355" width="70" height="5" fill="#7f8c8d" />
            <rect x="210" y="360" width="80" height="5" fill="#95a5a6" />

            {/* Trees - more detailed */}
            <g>
              <rect x="95" y="330" width="15" height="30" fill="#8b4513" />
              <ellipse cx="102.5" cy="320" rx="25" ry="30" fill="#27ae60" />
              <ellipse
                cx="95"
                cy="315"
                rx="20"
                ry="25"
                fill="#2ecc71"
                opacity="0.8"
              />
              <ellipse
                cx="110"
                cy="315"
                rx="20"
                ry="25"
                fill="#2ecc71"
                opacity="0.8"
              />
            </g>

            <g>
              <rect x="390" y="330" width="15" height="30" fill="#8b4513" />
              <ellipse cx="397.5" cy="320" rx="25" ry="30" fill="#27ae60" />
              <ellipse
                cx="390"
                cy="315"
                rx="20"
                ry="25"
                fill="#2ecc71"
                opacity="0.8"
              />
              <ellipse
                cx="405"
                cy="315"
                rx="20"
                ry="25"
                fill="#2ecc71"
                opacity="0.8"
              />
            </g>

            {/* Bushes */}
            <ellipse cx="130" cy="355" rx="15" ry="10" fill="#27ae60" />
            <ellipse cx="370" cy="355" rx="15" ry="10" fill="#27ae60" />

            {/* Ground with path */}
            <rect
              x="0"
              y="360"
              width="500"
              height="90"
              fill={isNightMode ? "#1a4d2e" : "#2ecc71"}
            />
            <path
              d="M 220 360 L 240 450 L 260 450 L 280 360 Z"
              fill="#95a5a6"
            />

            {/* Grass details */}
            {!isNightMode && (
              <>
                {/* Left side grass (0-220) */}
                {[
                  10, 25, 40, 55, 70, 85, 100, 115, 130, 145, 160, 175, 190,
                  205,
                ].map((x) => (
                  <g key={`left-${x}`}>
                    <line
                      x1={x}
                      y1="370"
                      x2={x + 5}
                      y2="365"
                      stroke="#27ae60"
                      strokeWidth="2"
                    />
                    <line
                      x1={x + 8}
                      y1="375"
                      x2={x + 13}
                      y2="370"
                      stroke="#27ae60"
                      strokeWidth="2"
                    />
                    <line
                      x1={x + 3}
                      y1="385"
                      x2={x + 8}
                      y2="380"
                      stroke="#27ae60"
                      strokeWidth="2"
                    />
                    <line
                      x1={x + 12}
                      y1="390"
                      x2={x + 17}
                      y2="385"
                      stroke="#27ae60"
                      strokeWidth="2"
                    />
                  </g>
                ))}
                {/* Right side grass (280-500) */}
                {[
                  290, 305, 320, 335, 350, 365, 380, 395, 410, 425, 440, 455,
                  470, 485,
                ].map((x) => (
                  <g key={`right-${x}`}>
                    <line
                      x1={x}
                      y1="370"
                      x2={x + 5}
                      y2="365"
                      stroke="#27ae60"
                      strokeWidth="2"
                    />
                    <line
                      x1={x + 8}
                      y1="375"
                      x2={x + 13}
                      y2="370"
                      stroke="#27ae60"
                      strokeWidth="2"
                    />
                    <line
                      x1={x + 3}
                      y1="385"
                      x2={x + 8}
                      y2="380"
                      stroke="#27ae60"
                      strokeWidth="2"
                    />
                    <line
                      x1={x + 12}
                      y1="390"
                      x2={x + 17}
                      y2="385"
                      stroke="#27ae60"
                      strokeWidth="2"
                    />
                  </g>
                ))}
              </>
            )}

            {/* Street lamps for night mode */}
            {isNightMode && (
              <>
                <g>
                  <rect x="115" y="310" width="5" height="50" fill="#34495e" />
                  <circle
                    cx="117.5"
                    cy="305"
                    r="8"
                    fill="#f39c12"
                    opacity="0.9"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.9;0.7;0.9"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <ellipse
                    cx="117.5"
                    cy="305"
                    rx="15"
                    ry="20"
                    fill="#f39c12"
                    opacity="0.3"
                  />
                </g>
                <g>
                  <rect x="380" y="310" width="5" height="50" fill="#34495e" />
                  <circle
                    cx="382.5"
                    cy="305"
                    r="8"
                    fill="#f39c12"
                    opacity="0.9"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.9;0.7;0.9"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <ellipse
                    cx="382.5"
                    cy="305"
                    rx="15"
                    ry="20"
                    fill="#f39c12"
                    opacity="0.3"
                  />
                </g>
              </>
            )}
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
      {showAlarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative bg-gradient-to-br from-red-900 to-red-950 p-8 rounded-3xl shadow-2xl border-4 border-red-500 max-w-md w-full mx-4 animate-in zoom-in duration-500">
            {/* Pulsing animation rings */}
            <div className="absolute inset-0 rounded-3xl border-4 border-red-500 animate-ping opacity-75"></div>
            <div className="absolute inset-0 rounded-3xl border-4 border-red-400 animate-pulse"></div>

            <div className="relative z-10">
              {/* Alarm icon with rotation animation */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <AlertTriangle className="w-24 h-24 text-red-500 animate-bounce" />
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse"></div>
                </div>
              </div>

              {/* Alarm text */}
              <h2 className="text-3xl font-bold text-center mb-4 text-white animate-pulse">
                🚨 ALERTE INTRUSION 🚨
              </h2>

              <div className="bg-black/30 p-4 rounded-xl mb-6">
                <p className="text-center text-red-300 font-semibold">
                  {accessLog[0]?.message}
                </p>
                <p className="text-center text-gray-400 text-sm mt-2">
                  {accessLog[0]?.timestamp}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={() => {
                  setShowAlarm(false);
                  if (alarmAudio) {
                    alarmAudio.pause();
                    alarmAudio.currentTime = 0;
                  }
                }}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-105 shadow-lg shadow-red-500/50"
              >
                Fermer l'alarme
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Found PIN Popup (when defense is disabled) */}
      {foundPinPopup.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative bg-gradient-to-br from-green-900 to-green-950 p-8 rounded-3xl shadow-2xl border-4 border-green-500 max-w-md w-full mx-4 animate-in zoom-in duration-500">
            {/* Pulsing animation rings */}
            <div className="absolute inset-0 rounded-3xl border-4 border-green-500 animate-ping opacity-75"></div>
            <div className="absolute inset-0 rounded-3xl border-4 border-green-400 animate-pulse"></div>

            <div className="relative z-10">
              {/* Success icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <CheckCircle className="w-24 h-24 text-green-500 animate-bounce" />
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse"></div>
                </div>
              </div>

              {/* Success text */}
              <h2 className="text-3xl font-bold text-center mb-4 text-white animate-pulse">
                ✓ PIN Trouvé!
              </h2>

              <div className="bg-black/30 p-6 rounded-xl mb-6">
                <p className="text-center text-green-300 font-semibold text-lg mb-2">
                  L'attaque Brute Force a réussi
                </p>
                <p className="text-center text-white text-2xl font-mono font-bold mt-4 mb-2">
                  PIN: {foundPinPopup.pin}
                </p>
                <p className="text-center text-gray-400 text-sm mt-4">
                  Le système de défense était désactivé
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={() => {
                  setFoundPinPopup({ show: false, pin: "" });
                }}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-105 shadow-lg shadow-green-500/50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social Engineering Scenario Modal */}
      {showSocialEngineeringModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 p-4">
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border-4 border-yellow-500/50 max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-b-2 border-yellow-500/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/20 rounded-xl">
                    <User className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      📋 Scénario : L'attaque du "Technicien IT"
                    </h2>
                    <p className="text-sm text-gray-300 mt-1">
                      Ingénierie Sociale - Sécurité Physique
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSocialEngineeringModal(false);
                    setCurrentPhase(0);
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-red-500/20 rounded-lg"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
              {/* Contexte */}
              <div className="mb-6 bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded-r-xl">
                <h3 className="text-lg font-bold text-blue-300 mb-2">
                  Contexte
                </h3>
                <p className="text-white text-sm">
                  Une entreprise technologique avec un système de badges d'accès
                </p>
              </div>

              {/* Phases */}
              <div className="space-y-4">
                {/* Phase 1 */}
                <div
                  className={`bg-slate-800/50 border-2 rounded-xl p-5 transition-all duration-500 ${
                    currentPhase >= 0
                      ? "border-yellow-500/50 shadow-lg shadow-yellow-500/20 animate-in fade-in slide-in-from-left"
                      : "border-slate-700/50 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 font-bold text-lg">
                      1️⃣
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-3">
                        Reconnaissance (OSINT)
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span>
                            <strong>Recherche sur LinkedIn :</strong> identifier
                            les employés, organigramme
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span>
                            <strong>Site web de l'entreprise :</strong> photos
                            des bureaux, badges visibles
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span>
                            <strong>Réseaux sociaux :</strong> trouver le nom du
                            vrai prestataire IT
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span>
                            <strong>Google Maps :</strong> repérage des
                            entrées/sorties, caméras
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Phase 2 */}
                <div
                  className={`bg-slate-800/50 border-2 rounded-xl p-5 transition-all duration-500 ${
                    currentPhase >= 1
                      ? "border-yellow-500/50 shadow-lg shadow-yellow-500/20"
                      : "border-slate-700/50 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 font-bold text-lg">
                      2️⃣
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-3">
                        Préparation
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span>
                            Création d'un <strong>faux badge</strong> avec logo
                            de l'entreprise de maintenance
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span>
                            Préparation d'un <strong>clipboard</strong>, outils
                            techniques
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span>
                            Vêtements appropriés (
                            <strong>polo avec logo</strong> du prestataire)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span>
                            Préparation du <strong>prétexte</strong> et des
                            réponses aux questions
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Phase 3 */}
                <div
                  className={`bg-slate-800/50 border-2 rounded-xl p-5 transition-all ${
                    currentPhase >= 2
                      ? "border-yellow-500/50 shadow-lg shadow-yellow-500/20"
                      : "border-slate-700/50 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 font-bold text-lg">
                      3️⃣
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-3">
                        Exécution de l'attaque
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                          <p className="text-red-300 font-semibold mb-2">
                            Heure : 8h30 (heure de pointe, réceptionniste
                            occupée)
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-300 font-semibold mb-2">
                            Action :
                          </p>
                          <p className="text-gray-300 mb-2">
                            Attaquant arrive avec :
                          </p>
                          <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                            <li>Clipboard à la main</li>
                            <li>Badge factice visible autour du cou</li>
                            <li>Grosse boîte d'équipement</li>
                            <li>Air pressé et léger agacement</li>
                          </ul>
                        </div>
                        <div className="bg-yellow-900/20 border-l-4 border-yellow-500 rounded-r-lg p-4 mt-3">
                          <p className="text-yellow-300 font-semibold mb-2">
                            Dialogue type :
                          </p>
                          <p className="text-white italic leading-relaxed">
                            "Bonjour ! Je suis de chez TechSupport Pro, j'ai un
                            ticket urgent pour le serveur qui plante au 3ème
                            étage. Votre responsable IT, Monsieur Dubois, m'a
                            appelé ce matin. Je dois y accéder rapidement sinon
                            toute la prod s'arrête !"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase 4 */}
                <div
                  className={`bg-slate-800/50 border-2 rounded-xl p-5 transition-all ${
                    currentPhase >= 3
                      ? "border-yellow-500/50 shadow-lg shadow-yellow-500/20"
                      : "border-slate-700/50 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 font-bold text-lg">
                      4️⃣
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-3">
                        Techniques de manipulation utilisées
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                          <p className="text-purple-300 font-semibold">
                            Autorité
                          </p>
                          <p className="text-gray-300 text-xs mt-1">
                            Mention du nom du responsable IT
                          </p>
                        </div>
                        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                          <p className="text-red-300 font-semibold">Urgence</p>
                          <p className="text-gray-300 text-xs mt-1">
                            "Problème critique", "production en danger"
                          </p>
                        </div>
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                          <p className="text-blue-300 font-semibold">
                            Familiarité
                          </p>
                          <p className="text-gray-300 text-xs mt-1">
                            Connaît les noms, les lieux, le jargon
                          </p>
                        </div>
                        <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                          <p className="text-orange-300 font-semibold">
                            Tailgating
                          </p>
                          <p className="text-gray-300 text-xs mt-1">
                            Suit quelqu'un qui a un vrai badge
                          </p>
                        </div>
                        <div className="bg-pink-900/20 border border-pink-500/30 rounded-lg p-3">
                          <p className="text-pink-300 font-semibold">
                            Distraction
                          </p>
                          <p className="text-gray-300 text-xs mt-1">
                            Heure de pointe, fausse urgence
                          </p>
                        </div>
                        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                          <p className="text-green-300 font-semibold">
                            Confiance
                          </p>
                          <p className="text-gray-300 text-xs mt-1">
                            Apparence professionnelle, équipement crédible
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase 5 */}
                <div
                  className={`bg-slate-800/50 border-2 rounded-xl p-5 transition-all ${
                    currentPhase >= 4
                      ? "border-red-500/50 shadow-lg shadow-red-500/20"
                      : "border-slate-700/50 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 font-bold text-lg">
                      5️⃣
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-3">
                        Tentative d'accès non autorisé
                      </h3>
                      {defensesEnabled ? (
                        <div className="bg-yellow-950/50 border-l-4 border-yellow-500 rounded-r-lg p-4">
                          <p className="text-yellow-300 font-semibold mb-3">
                            ⚠️ L'attaquant tente d'entrer dans les locaux
                          </p>
                          <p className="text-gray-300 text-sm mb-2">
                            Mais le système de sécurité va détecter l'attaque...
                          </p>
                        </div>
                      ) : (
                        <div className="bg-red-950/50 border-l-4 border-red-500 rounded-r-lg p-4">
                          <p className="text-red-300 font-semibold mb-3">
                            → Entre dans les locaux (Défense désactivée)
                          </p>
                          <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">→</span>
                              <span>
                                Accède aux serveurs ou zones sensibles
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">→</span>
                              <span>
                                Clone des badges avec un lecteur RFID portable
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">→</span>
                              <span>
                                Installe un keylogger ou un dispositif d'écoute
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">→</span>
                              <span>Vole des documents confidentiels</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">→</span>
                              <span>Sort discrètement</span>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Phase 6 - Détection du système (seulement si défense activée) */}
                {defensesEnabled && (
                  <div
                    className={`bg-slate-800/50 border-2 rounded-xl p-5 transition-all duration-500 ${
                      currentPhase >= 5
                        ? "border-green-500/50 shadow-lg shadow-green-500/20"
                        : "border-slate-700/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold text-lg">
                        6️⃣
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-3">
                          🛡️ Détection du Système de Sécurité
                        </h3>
                        <div className="space-y-4">
                          {/* Indicateur 1 */}
                          <div className="bg-green-900/30 border-l-4 border-green-500 rounded-r-lg p-4">
                            <div className="flex items-start gap-3">
                              <Shield className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                              <div>
                                <p className="text-green-300 font-semibold mb-1">
                                  1. Vérification du Badge
                                </p>
                                <p className="text-gray-300 text-sm">
                                  Le système détecte que l'attaquant n'a pas de
                                  badge valide dans la base de données
                                </p>
                                <p className="text-red-300 text-xs mt-2 font-mono">
                                  ❌ Badge "TechSupport Pro" non trouvé dans le
                                  système
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Indicateur 2 */}
                          <div className="bg-green-900/30 border-l-4 border-green-500 rounded-r-lg p-4">
                            <div className="flex items-start gap-3">
                              <Bell className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                              <div>
                                <p className="text-green-300 font-semibold mb-1">
                                  2. Double Authentification Requise
                                </p>
                                <p className="text-gray-300 text-sm">
                                  Le système exige PIN + Badge - L'attaquant ne
                                  peut pas fournir les deux
                                </p>
                                <p className="text-red-300 text-xs mt-2 font-mono">
                                  ❌ Tentative d'accès avec seulement un
                                  prétexte verbal
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Indicateur 3 */}
                          <div className="bg-green-900/30 border-l-4 border-green-500 rounded-r-lg p-4">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                              <div>
                                <p className="text-yellow-300 font-semibold mb-1">
                                  3. Analyse Comportementale
                                </p>
                                <p className="text-gray-300 text-sm">
                                  Le système détecte un comportement suspect :
                                </p>
                                <ul className="text-gray-300 text-xs mt-2 space-y-1 ml-4">
                                  <li>• Pas de badge enregistré</li>
                                  <li>• Heure inhabituelle (8h30 - pointe)</li>
                                  <li>• Aucun ticket IT dans le système</li>
                                  <li>
                                    • Tentative d'accès sans authentification
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Résultat */}
                          <div className="bg-red-900/30 border-2 border-red-500/50 rounded-lg p-4 mt-4">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
                              <div>
                                <p className="text-red-300 font-bold text-lg">
                                  🚨 ALERTE INTRUSION DÉCLENCHÉE
                                </p>
                                <p className="text-white text-sm mt-1">
                                  Accès refusé - Sécurité notifiée
                                </p>
                                <p className="text-gray-300 text-xs mt-2">
                                  L'attaquant est bloqué avant d'entrer dans les
                                  locaux
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with navigation */}
            <div className="bg-slate-900/80 border-t-2 border-yellow-500/50 p-4 flex items-center justify-between gap-4">
              <button
                onClick={() => setCurrentPhase(Math.max(0, currentPhase - 1))}
                disabled={currentPhase === 0}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Précédent
              </button>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, ...(defensesEnabled ? [5] : [])].map(
                  (phase) => (
                    <button
                      key={phase}
                      onClick={() => setCurrentPhase(phase)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        currentPhase >= phase ? "bg-yellow-500" : "bg-gray-600"
                      }`}
                    />
                  )
                )}
              </div>
              <button
                onClick={() => {
                  const maxPhase = defensesEnabled ? 5 : 4;
                  if (currentPhase < maxPhase) {
                    setCurrentPhase(currentPhase + 1);
                  } else {
                    // Final action - trigger defense or attack
                    if (defensesEnabled) {
                      triggerAlarm(
                        "Ingénierie Sociale détectée - Accès refusé"
                      );
                      addLog(
                        "Défense",
                        "🛡️ DÉFENSE ACTIVÉE: Attaque d'ingénierie sociale détectée et bloquée",
                        true
                      );
                      addLog(
                        "Défense",
                        "🛡️ Double authentification requise - Badge invalide détecté",
                        true
                      );
                    } else {
                      addLog(
                        "Attaque",
                        "⚠️ RÉUSSITE: L'attaquant a obtenu l'accès via ingénierie sociale",
                        false
                      );
                      // Rediriger vers welcome si l'attaque réussit
                      setTimeout(() => {
                        router.push("/welcome");
                      }, 1000);
                    }
                    setShowSocialEngineeringModal(false);
                    setCurrentPhase(0);
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white rounded-lg transition-all flex items-center gap-2 font-semibold"
              >
                {currentPhase < (defensesEnabled ? 5 : 4) ? (
                  <>
                    Suivant
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </>
                ) : (
                  "Terminer le scénario"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bypass System Scenario Modal */}
      {showBypassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 p-4">
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border-4 border-purple-500/50 max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b-2 border-purple-500/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Unlock className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      🔓 Scénario : Bypass Système
                    </h2>
                    <p className="text-sm text-gray-300 mt-1">
                      Contournement des contrôles d'accès
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowBypassModal(false);
                    setCurrentBypassPhase(0);
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-red-500/20 rounded-lg"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
              {/* Contexte */}
              <div className="mb-6 bg-purple-900/30 border-l-4 border-purple-500 p-4 rounded-r-xl">
                <h3 className="text-lg font-bold text-purple-300 mb-2">
                  Contexte
                </h3>
                <p className="text-white text-sm">
                  Un attaquant tente de contourner les systèmes de contrôle
                  d'accès en exploitant des vulnérabilités techniques
                </p>
              </div>

              {/* Phases */}
              <div className="space-y-4">
                {/* Phase 1 */}
                <div
                  className={`bg-slate-800/50 border-2 rounded-xl p-5 transition-all duration-500 ${
                    currentBypassPhase >= 0
                      ? "border-purple-500/50 shadow-lg shadow-purple-500/20 animate-in fade-in slide-in-from-left"
                      : "border-slate-700/50 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold text-lg">
                      1️⃣
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-3">
                        Reconnaissance & Scan
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">•</span>
                          <span>
                            <strong>Scan réseau :</strong> Identification des
                            ports ouverts et services actifs
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">•</span>
                          <span>
                            <strong>Analyse du système :</strong> Détection du
                            type de contrôleur d'accès (RFID, PIN, biométrie)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">•</span>
                          <span>
                            <strong>Recherche de vulnérabilités :</strong> CVE
                            connues, firmware obsolète, configurations par
                            défaut
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">•</span>
                          <span>
                            <strong>Cartographie réseau :</strong>{" "}
                            Identification des points d'entrée et chemins
                            d'accès
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Phase 2 */}
                <div
                  className={`bg-slate-800/50 border-2 rounded-xl p-5 transition-all duration-500 ${
                    currentBypassPhase >= 1
                      ? "border-purple-500/50 shadow-lg shadow-purple-500/20"
                      : "border-slate-700/50 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold text-lg">
                      2️⃣
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-3">
                        Identification des Vulnérabilités
                      </h3>
                      <div className="space-y-3">
                        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                          <p className="text-red-300 font-semibold mb-2">
                            Vulnérabilités détectées :
                          </p>
                          <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">⚠️</span>
                              <span>
                                <strong>Port de maintenance exposé :</strong>{" "}
                                Interface d'administration accessible
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">⚠️</span>
                              <span>
                                <strong>Mots de passe par défaut :</strong>{" "}
                                admin/admin, root/root
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">⚠️</span>
                              <span>
                                <strong>Firmware obsolète :</strong> Version
                                1.2.3 (CVE-2023-XXXX exploitables)
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">⚠️</span>
                              <span>
                                <strong>Communication non chiffrée :</strong>{" "}
                                Protocole HTTP au lieu de HTTPS
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase 3 */}
                <div
                  className={`bg-slate-800/50 border-2 rounded-xl p-5 transition-all duration-500 ${
                    currentBypassPhase >= 2
                      ? "border-purple-500/50 shadow-lg shadow-purple-500/20"
                      : "border-slate-700/50 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold text-lg">
                      3️⃣
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-3">
                        Préparation de l'Attaque
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">•</span>
                          <span>
                            Création d'un <strong>script d'exploitation</strong>{" "}
                            pour exploiter les CVE identifiées
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">•</span>
                          <span>
                            Préparation d'un <strong>accès physique</strong> au
                            port de maintenance
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">•</span>
                          <span>
                            Configuration d'un{" "}
                            <strong>outil de brute force</strong> pour les
                            identifiants par défaut
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">•</span>
                          <span>
                            Mise en place d'un{" "}
                            <strong>intercepteur réseau</strong> pour capturer
                            les communications
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Phase 4 */}
                <div
                  className={`bg-slate-800/50 border-2 rounded-xl p-5 transition-all duration-500 ${
                    currentBypassPhase >= 3
                      ? "border-purple-500/50 shadow-lg shadow-purple-500/20"
                      : "border-slate-700/50 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold text-lg">
                      4️⃣
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-3">
                        Exécution du Bypass
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                          <p className="text-orange-300 font-semibold mb-2">
                            Méthode 1 : Accès au port de maintenance
                          </p>
                          <p className="text-gray-300 text-xs">
                            Connexion directe au port de maintenance du
                            contrôleur
                          </p>
                          <p className="text-white font-mono text-xs mt-2 bg-slate-900/50 p-2 rounded">
                            $ telnet 192.168.1.100 23
                            <br />
                            Login: admin
                            <br />
                            Password: admin
                          </p>
                        </div>
                        <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                          <p className="text-orange-300 font-semibold mb-2">
                            Méthode 2 : Exploitation de CVE
                          </p>
                          <p className="text-gray-300 text-xs">
                            Exploitation d'une vulnérabilité dans le firmware
                          </p>
                          <p className="text-white font-mono text-xs mt-2 bg-slate-900/50 p-2 rounded">
                            $ python3 exploit.py --target 192.168.1.100
                            <br />
                            [*] Exploiting CVE-2023-XXXX...
                            <br />
                            [*] Shell access obtained!
                          </p>
                        </div>
                        <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                          <p className="text-orange-300 font-semibold mb-2">
                            Méthode 3 : Manipulation des logs
                          </p>
                          <p className="text-gray-300 text-xs">
                            Modification des logs pour masquer l'accès non
                            autorisé
                          </p>
                        </div>
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              setShowTerminalDemo(true);
                              setTerminalOutput([]);
                              setTerminalCommandIndex(0);
                            }}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-2 px-4 rounded-lg transition-all hover:scale-105 font-semibold flex items-center justify-center gap-2"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            Voir la démonstration Terminal
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase 5 */}
                <div
                  className={`bg-slate-800/50 border-2 rounded-xl p-5 transition-all ${
                    currentBypassPhase >= 4
                      ? "border-red-500/50 shadow-lg shadow-red-500/20"
                      : "border-slate-700/50 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 font-bold text-lg">
                      5️⃣
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-3">
                        Accès non autorisé obtenu
                      </h3>
                      {defensesEnabled ? (
                        <div className="bg-yellow-950/50 border-l-4 border-yellow-500 rounded-r-lg p-4">
                          <p className="text-yellow-300 font-semibold mb-3">
                            ⚠️ L'attaquant tente d'obtenir l'accès
                          </p>
                          <p className="text-gray-300 text-sm mb-2">
                            Mais le système de sécurité va détecter l'attaque...
                          </p>
                        </div>
                      ) : (
                        <div className="bg-red-950/50 border-l-4 border-red-500 rounded-r-lg p-4">
                          <p className="text-red-300 font-semibold mb-3">
                            → Accès système obtenu (Défense désactivée)
                          </p>
                          <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">→</span>
                              <span>Contrôleur d'accès compromis</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">→</span>
                              <span>
                                Création de badges administrateurs factices
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">→</span>
                              <span>Désactivation des alarmes et logs</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">→</span>
                              <span>Accès permanent aux zones sensibles</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">→</span>
                              <span>
                                Installation de backdoors pour accès futur
                              </span>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Phase 6 - Détection du système (seulement si défense activée) */}
                {defensesEnabled && (
                  <div
                    className={`bg-slate-800/50 border-2 rounded-xl p-5 transition-all duration-500 ${
                      currentBypassPhase >= 5
                        ? "border-green-500/50 shadow-lg shadow-green-500/20"
                        : "border-slate-700/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold text-lg">
                        6️⃣
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-3">
                          🛡️ Détection du Système de Sécurité
                        </h3>
                        <div className="space-y-4">
                          {/* Indicateur 1 */}
                          <div className="bg-green-900/30 border-l-4 border-green-500 rounded-r-lg p-4">
                            <div className="flex items-start gap-3">
                              <Shield className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                              <div>
                                <p className="text-green-300 font-semibold mb-1">
                                  1. Détection d'Anomalies Réseau
                                </p>
                                <p className="text-gray-300 text-sm">
                                  Le système détecte des connexions suspectes au
                                  port de maintenance
                                </p>
                                <p className="text-red-300 text-xs mt-2 font-mono">
                                  ⚠️ Tentative de connexion non autorisée
                                  détectée
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Indicateur 2 */}
                          <div className="bg-green-900/30 border-l-4 border-green-500 rounded-r-lg p-4">
                            <div className="flex items-start gap-3">
                              <Bell className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                              <div>
                                <p className="text-green-300 font-semibold mb-1">
                                  2. Pare-feu & IPS
                                </p>
                                <p className="text-gray-300 text-sm">
                                  Le pare-feu bloque les tentatives
                                  d'exploitation de CVE
                                </p>
                                <p className="text-red-300 text-xs mt-2 font-mono">
                                  🛡️ Tentative d'exploitation CVE-2023-XXXX
                                  bloquée
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Indicateur 3 */}
                          <div className="bg-green-900/30 border-l-4 border-green-500 rounded-r-lg p-4">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                              <div>
                                <p className="text-yellow-300 font-semibold mb-1">
                                  3. Monitoring & Alertes
                                </p>
                                <p className="text-gray-300 text-sm">
                                  Le système de monitoring détecte :
                                </p>
                                <ul className="text-gray-300 text-xs mt-2 space-y-1 ml-4">
                                  <li>
                                    • Tentatives de connexion avec identifiants
                                    par défaut
                                  </li>
                                  <li>
                                    • Trafic réseau anormal vers le contrôleur
                                  </li>
                                  <li>• Tentatives de modification des logs</li>
                                  <li>
                                    • Activité suspecte sur le port de
                                    maintenance
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Résultat */}
                          <div className="bg-red-900/30 border-2 border-red-500/50 rounded-lg p-4 mt-4">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
                              <div>
                                <p className="text-red-300 font-bold text-lg">
                                  🚨 ALERTE INTRUSION DÉCLENCHÉE
                                </p>
                                <p className="text-white text-sm mt-1">
                                  Bypass système détecté et bloqué
                                </p>
                                <p className="text-gray-300 text-xs mt-2">
                                  Port de maintenance isolé - Accès système
                                  verrouillé
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with navigation */}
            <div className="bg-slate-900/80 border-t-2 border-purple-500/50 p-4 flex items-center justify-between gap-4">
              <button
                onClick={() =>
                  setCurrentBypassPhase(Math.max(0, currentBypassPhase - 1))
                }
                disabled={currentBypassPhase === 0}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Précédent
              </button>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, ...(defensesEnabled ? [5] : [])].map(
                  (phase) => (
                    <button
                      key={phase}
                      onClick={() => setCurrentBypassPhase(phase)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        currentBypassPhase >= phase
                          ? "bg-purple-500"
                          : "bg-gray-600"
                      }`}
                    />
                  )
                )}
              </div>
              <button
                onClick={() => {
                  const maxPhase = defensesEnabled ? 5 : 4;
                  if (currentBypassPhase < maxPhase) {
                    setCurrentBypassPhase(currentBypassPhase + 1);
                  } else {
                    // Final action - trigger defense or attack
                    if (defensesEnabled) {
                      triggerAlarm(
                        "Bypass système détecté - Tentative de contournement bloquée"
                      );
                      addLog(
                        "Défense",
                        "🛡️ DÉFENSE ACTIVÉE: Tentative de bypass système détectée et bloquée",
                        true
                      );
                      addLog(
                        "Défense",
                        "🛡️ Pare-feu et IPS ont bloqué les tentatives d'exploitation",
                        true
                      );
                    } else {
                      addLog(
                        "Attaque",
                        "⚠️ RÉUSSITE: Bypass système réussi - Accès non autorisé obtenu",
                        false
                      );
                      // Rediriger vers welcome si l'attaque réussit
                      setTimeout(() => {
                        router.push("/welcome");
                      }, 1000);
                    }
                    setShowBypassModal(false);
                    setCurrentBypassPhase(0);
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all flex items-center gap-2 font-semibold"
              >
                {currentBypassPhase < (defensesEnabled ? 5 : 4) ? (
                  <>
                    Suivant
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </>
                ) : (
                  "Terminer le scénario"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Demo Modal */}
      {showTerminalDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300 p-4">
          <div className="relative bg-gradient-to-br from-slate-900 via-black to-slate-900 rounded-2xl shadow-2xl border-2 border-green-500/50 max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-b-2 border-green-500/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h2 className="text-xl font-bold text-green-400 ml-4">
                    Terminal - Démonstration Bypass Système
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowTerminalDemo(false);
                    setTerminalOutput([]);
                    setTerminalCommandIndex(0);
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-red-500/20 rounded-lg"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Terminal Content */}
            <div className="p-6 bg-black/50 h-[500px] overflow-y-auto custom-scrollbar">
              <div className="font-mono text-sm text-green-400 space-y-1">
                <div className="text-gray-500 mb-4">
                  <span className="text-green-400">root@hacker</span>
                  <span className="text-gray-400">:</span>
                  <span className="text-blue-400">~</span>
                  <span className="text-gray-400">$</span>
                  <span className="text-yellow-400 ml-2">
                    # Démonstration de bypass système
                  </span>
                </div>
                {terminalOutput.map((line, index) => (
                  <div
                    key={index}
                    className={`${
                      line.startsWith("$")
                        ? "text-blue-400"
                        : line.includes("error") ||
                          line.includes("Error") ||
                          line.includes("failed")
                        ? "text-red-400"
                        : line.includes("success") ||
                          line.includes("Success") ||
                          line.includes("obtained")
                        ? "text-green-400"
                        : "text-gray-300"
                    }`}
                  >
                    {line}
                  </div>
                ))}
                {terminalCommandIndex < 9 && (
                  <div className="text-green-400 animate-pulse">
                    <span className="text-gray-400">$</span>{" "}
                    <span className="inline-block w-2 h-4 bg-green-400 animate-pulse"></span>
                  </div>
                )}
                {terminalCommandIndex >= 9 && (
                  <div className="mt-4 text-yellow-400">
                    <div className="text-green-400">root@hacker</div>
                    <div className="text-gray-500">
                      # Bypass terminé. Système compromis.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-900/50 border-t border-green-500/30 p-4 flex items-center justify-between">
              <div className="text-xs text-gray-400">
                {terminalCommandIndex < 9
                  ? "Exécution en cours..."
                  : "Démonstration terminée"}
              </div>
              <button
                onClick={() => {
                  setShowTerminalDemo(false);
                  setTerminalOutput([]);
                  setTerminalCommandIndex(0);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="mt-4 sm:mt-6 md:mt-8 mb-4 sm:mb-6 md:mb-8 flex justify-between items-center gap-4">
          {/* KHALIHA 3ALA LAH SECURITY Brand */}
          <div className="relative group">
            {/* Outer glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>

            {/* Main container with shield-like styling */}
            <div
              className="relative bg-gradient-to-b from-teal-900/95 via-slate-900/95 to-teal-900/95 backdrop-blur-sm px-4 sm:px-5 md:px-7 py-2.5 sm:py-3 md:py-4 rounded-xl border-2 border-slate-400/60 shadow-2xl shadow-teal-500/30"
              style={{
                clipPath:
                  "polygon(5% 0%, 95% 0%, 100% 10%, 100% 90%, 95% 100%, 5% 100%, 0% 90%, 0% 10%)",
              }}
            >
              {/* Circuit board pattern overlay */}
              <div className="absolute inset-0 opacity-20 rounded-xl overflow-hidden">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 200 60"
                  preserveAspectRatio="none"
                >
                  {/* Green circuit lines */}
                  <path
                    d="M 10 15 L 40 15 L 50 25 L 70 25 L 80 15 L 120 15"
                    stroke="#10b981"
                    strokeWidth="0.5"
                    fill="none"
                  />
                  <path
                    d="M 15 30 L 35 30 L 45 40 L 65 40 L 75 30 L 115 30"
                    stroke="#10b981"
                    strokeWidth="0.5"
                    fill="none"
                  />
                  <path
                    d="M 20 45 L 130 45"
                    stroke="#10b981"
                    strokeWidth="0.5"
                    fill="none"
                  />
                  <path
                    d="M 140 20 L 180 20"
                    stroke="#10b981"
                    strokeWidth="0.5"
                    fill="none"
                  />
                  <path
                    d="M 145 35 L 185 35"
                    stroke="#10b981"
                    strokeWidth="0.5"
                    fill="none"
                  />
                  {/* Circuit nodes */}
                  <circle cx="40" cy="15" r="1.5" fill="#10b981" />
                  <circle cx="70" cy="25" r="1.5" fill="#10b981" />
                  <circle cx="35" cy="30" r="1.5" fill="#10b981" />
                  <circle cx="65" cy="40" r="1.5" fill="#10b981" />
                  <circle cx="145" cy="20" r="1.5" fill="#10b981" />
                  <circle cx="185" cy="35" r="1.5" fill="#10b981" />
                </svg>
              </div>

              {/* Content */}
              <div className="relative flex items-center gap-2 sm:gap-3 md:gap-4">
                {/* Main text with metallic effect */}
                <div className="flex flex-col">
                  <span
                    className="text-slate-200 font-black text-xs sm:text-sm md:text-base lg:text-lg tracking-wider"
                    style={{
                      background:
                        "linear-gradient(180deg, #e5e7eb 0%, #d1d5db 50%, #f3f4f6 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                      filter: "drop-shadow(0 1px 2px rgba(255,255,255,0.3))",
                    }}
                  >
                    KHALIHA 3ALA LAH
                  </span>
                  <span
                    className="text-green-400 font-semibold text-[9px] sm:text-[10px] md:text-xs tracking-widest uppercase"
                    style={{
                      textShadow: "0 0 8px rgba(16, 185, 129, 0.6)",
                    }}
                  >
                    SECURITY
                  </span>
                </div>

                {/* Padlock icon in green border box */}
                <div className="ml-1 sm:ml-2 border-2 border-green-500/70 rounded p-1 sm:p-1.5 bg-slate-800/50">
                  <Lock className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-400" />
                </div>
              </div>

              {/* Inner shadow for 3D effect */}
              <div className="absolute inset-0 rounded-xl border-t border-white/10 pointer-events-none"></div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => {
                // If we're on /syscontrol, redirect to home, otherwise just change view
                if (pathname === "/syscontrol") {
                  router.push("/");
                } else {
                  setCurrentView("building");
                }
              }}
              className="bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-1.5 sm:gap-2 shadow-lg border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm md:text-base">Retour</span>
            </button>
            <button
              onClick={() => setShowAttackPanel(!showAttackPanel)}
              className={`${
                showAttackPanel
                  ? "bg-red-600/90 hover:bg-red-700"
                  : "bg-red-600/90 hover:bg-red-700"
              } backdrop-blur-sm text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-1.5 sm:gap-2 shadow-lg border ${
                showAttackPanel ? "border-red-400" : "border-transparent"
              }`}
            >
              <Sword className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm md:text-base">Attaques</span>
            </button>
          </div>
        </div>

        {showAttackPanel && (
          <div className="mb-4 sm:mb-6 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-3 sm:p-4 md:p-6 border-2 border-red-500/50 shadow-2xl shadow-red-500/20 animate-in fade-in duration-300">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Sword className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
              Simulations d'Attaques
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <button
                onClick={() => simulateAttack("brute-force")}
                className="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white p-3 sm:p-4 md:p-5 rounded-xl transition-all hover:scale-105 shadow-lg hover:shadow-red-500/50 border border-red-400/30"
              >
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mb-2 mx-auto" />
                <div className="font-semibold text-xs sm:text-sm md:text-base">
                  Brute Force
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm opacity-90 mt-1">
                  Essais répétés de codes PIN
                </div>
              </button>
              <button
                onClick={() => simulateAttack("badge-clone")}
                className="bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white p-3 sm:p-4 md:p-5 rounded-xl transition-all hover:scale-105 shadow-lg hover:shadow-orange-500/50 border border-orange-400/30"
              >
                <Key className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mb-2 mx-auto" />
                <div className="font-semibold text-xs sm:text-sm md:text-base">
                  Clonage Badge
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm opacity-90 mt-1">
                  Badge: BADGE001_CLONE
                </div>
              </button>
              <button
                onClick={() => simulateAttack("social-engineering")}
                className="bg-gradient-to-br from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white p-3 sm:p-4 md:p-5 rounded-xl transition-all hover:scale-105 shadow-lg hover:shadow-yellow-500/50 border border-yellow-400/30"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mb-2 mx-auto" />
                <div className="font-semibold text-xs sm:text-sm md:text-base">
                  Social Engineering
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm opacity-90 mt-1">
                  Sécurité Physique
                </div>
              </button>
              <button
                onClick={() => simulateAttack("bypass")}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white p-3 sm:p-4 md:p-5 rounded-xl transition-all hover:scale-105 shadow-lg hover:shadow-purple-500/50 border border-purple-400/30"
              >
                <Unlock className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mb-2 mx-auto" />
                <div className="font-semibold text-xs sm:text-sm md:text-base">
                  Bypass Système
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm opacity-90 mt-1">
                  Accès direct
                </div>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Left Section - Access Control */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-3 sm:p-4 md:p-6 border-2 border-blue-500/50 shadow-2xl shadow-blue-500/10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`p-1.5 sm:p-2 rounded-xl ${
                      defensesEnabled ? "bg-green-500/20" : "bg-gray-500/20"
                    }`}
                  >
                    <Shield
                      className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${
                        defensesEnabled ? "text-green-400" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">
                      Système de Défense
                    </h2>
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-400">
                      {defensesEnabled ? "Protection active" : "Mode standard"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDefensesEnabled(!defensesEnabled);
                    resetSystem();
                    addLog(
                      "Système",
                      `Défenses ${
                        !defensesEnabled ? "activées" : "désactivées"
                      }`,
                      true
                    );
                  }}
                  className={`px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition-all hover:scale-105 shadow-lg ${
                    defensesEnabled
                      ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 shadow-green-500/30"
                      : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600"
                  } text-white w-full sm:w-auto`}
                >
                  {defensesEnabled ? "Désactiver" : "Activer"}
                </button>
              </div>

              {defensesEnabled && (
                <div className="mt-4 sm:mt-5 md:mt-6 grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 animate-in fade-in duration-500">
                  {[
                    {
                      icon: Lock,
                      text: "Blocage après 3 tentatives",
                      iconColor: "text-blue-400",
                      bgColor: "bg-blue-500/10",
                      borderColor: "border-blue-500/50",
                      hoverBorderColor: "hover:border-blue-400",
                    },
                    {
                      icon: History,
                      text: "Enregistrement des tentatives",
                      iconColor: "text-purple-400",
                      bgColor: "bg-purple-500/10",
                      borderColor: "border-purple-500/50",
                      hoverBorderColor: "hover:border-purple-400",
                    },
                    {
                      icon: Shield,
                      text: "Double authentification",
                      iconColor: "text-cyan-400",
                      bgColor: "bg-cyan-500/10",
                      borderColor: "border-cyan-500/50",
                      hoverBorderColor: "hover:border-cyan-400",
                    },
                    {
                      icon: Bell,
                      text: "Alarme en cas d'intrusion",
                      iconColor: "text-red-400",
                      bgColor: "bg-red-500/10",
                      borderColor: "border-red-500/50",
                      hoverBorderColor: "hover:border-red-400",
                    },
                    {
                      icon: History,
                      text: "Historique des accès",
                      iconColor: "text-green-400",
                      bgColor: "bg-green-500/10",
                      borderColor: "border-green-500/50",
                      hoverBorderColor: "hover:border-green-400",
                    },
                    {
                      icon: AlertTriangle,
                      text: "Détection d'attaques",
                      iconColor: "text-yellow-400",
                      bgColor: "bg-yellow-500/10",
                      borderColor: "border-yellow-500/50",
                      hoverBorderColor: "hover:border-yellow-400",
                    },
                  ].map((feature, idx) => (
                    <div
                      key={idx}
                      className={`${feature.bgColor} backdrop-blur-sm p-2.5 sm:p-3 md:p-4 rounded-xl border ${feature.borderColor} ${feature.hoverBorderColor} transition-all hover:scale-105 shadow-lg`}
                    >
                      <feature.icon
                        className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${feature.iconColor} mb-1.5 sm:mb-2`}
                      />
                      <div className="text-[10px] sm:text-xs md:text-sm text-white font-semibold leading-tight">
                        {feature.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-3 sm:p-4 md:p-6 shadow-2xl border border-slate-700/50">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                Authentification
              </h2>

              {defensesEnabled && pinValidated && (
                <div className="mb-4 p-3 bg-green-900/30 border border-green-500/50 rounded-xl text-green-400 text-xs sm:text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Code PIN validé - Étape 2: Scannez votre badge</span>
                </div>
              )}

              <div className="flex gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
                <button
                  onClick={() => {
                    if (!defensesEnabled || !pinValidated) {
                      setSimpleModeChoice("PIN");
                      setAccessCode("");
                      setBadgeId("");
                    }
                  }}
                  disabled={defensesEnabled && pinValidated}
                  className={`flex-1 py-2.5 sm:py-3 rounded-xl font-semibold transition-all ${
                    simpleModeChoice === "PIN"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105"
                      : "bg-slate-700/50 text-gray-400 hover:bg-slate-600/50"
                  } ${
                    defensesEnabled && pinValidated
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <span className="text-xs sm:text-sm md:text-base">
                    Code PIN
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (!defensesEnabled) {
                      setSimpleModeChoice("BADGE");
                      setAccessCode("");
                      setBadgeId("");
                    }
                  }}
                  disabled={defensesEnabled && !pinValidated}
                  className={`flex-1 py-2.5 sm:py-3 rounded-xl font-semibold transition-all ${
                    simpleModeChoice === "BADGE"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105"
                      : "bg-slate-700/50 text-gray-400 hover:bg-slate-600/50"
                  } ${
                    defensesEnabled && !pinValidated
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <span className="text-xs sm:text-sm md:text-base">Badge</span>
                </button>
              </div>

              {simpleModeChoice === "PIN" && (
                <div className="space-y-3 sm:space-y-4">
                  {/* PIN Display */}
                  <div className="bg-slate-900/80 backdrop-blur-sm p-3 sm:p-4 md:p-6 rounded-xl border-2 border-slate-700 shadow-inner">
                    <div className="text-[10px] sm:text-xs md:text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <Key className="w-3 h-3 sm:w-4 sm:h-4" />
                      Code PIN
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-mono text-white tracking-[0.3em] sm:tracking-[0.5em] min-h-[40px] sm:min-h-[48px] md:min-h-[56px] flex items-center justify-center bg-slate-950/50 rounded-lg p-2">
                      {accessCode
                        ? accessCode.split("").map((digit, i) => (
                            <span
                              key={i}
                              className="inline-block w-6 sm:w-8 md:w-10 text-center animate-in fade-in"
                            >
                              {digit}
                            </span>
                          ))
                        : "----"}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3">
                    {[
                      "1",
                      "2",
                      "3",
                      "4",
                      "5",
                      "6",
                      "7",
                      "8",
                      "9",
                      "C",
                      "0",
                      "←",
                    ].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleNumberPad(num)}
                        disabled={isLocked}
                        className={`py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl font-bold rounded-xl transition-all hover:scale-105 shadow-lg ${
                          num === "C"
                            ? "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-500/30"
                            : num === "←"
                            ? "bg-gradient-to-br from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 shadow-yellow-500/30"
                            : "bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700"
                        } text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border border-slate-600/50`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] sm:text-xs text-gray-500 text-center bg-slate-900/50 rounded-lg py-1.5 sm:py-2">
                    Codes valides: 1234, 5678, 9999
                  </p>
                </div>
              )}

              {simpleModeChoice === "BADGE" && (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <Key className="w-3 h-3 sm:w-4 sm:h-4" />
                      Numéro de Badge
                    </label>
                    <input
                      type="text"
                      value={badgeId}
                      onChange={(e) => setBadgeId(e.target.value.toUpperCase())}
                      disabled={isLocked}
                      placeholder="BADGE001"
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-slate-900/80 backdrop-blur-sm text-white text-base sm:text-lg font-mono rounded-xl border-2 border-slate-700 focus:border-blue-500 outline-none disabled:opacity-50 transition-all shadow-inner"
                    />
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-2 sm:mt-3 bg-slate-900/50 rounded-lg py-1.5 sm:py-2 px-2 sm:px-3">
                      Badges valides: BADGE001, BADGE002, BADGE003
                    </p>
                  </div>
                </div>
              )}

              {defensesEnabled && (
                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 bg-slate-900/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-slate-700">
                  <div className="text-xs sm:text-sm text-gray-400 flex items-center gap-2">
                    <History className="w-3 h-3 sm:w-4 sm:h-4" />
                    Tentatives:{" "}
                    <span className="font-bold text-white">
                      {attempts}/{MAX_ATTEMPTS}
                    </span>
                  </div>
                  {isLocked && (
                    <div className="flex items-center gap-2 text-red-400 bg-red-950/50 px-2.5 sm:px-3 py-1 rounded-lg animate-pulse">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-xs sm:text-sm font-semibold">
                        Verrouillé
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 sm:mt-5 md:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                <button
                  onClick={handleAccessAttempt}
                  disabled={
                    isLocked ||
                    (simpleModeChoice === "PIN" && accessCode.length !== 4) ||
                    (simpleModeChoice === "BADGE" && !badgeId) ||
                    (defensesEnabled &&
                      simpleModeChoice === "BADGE" &&
                      !pinValidated) // Disable badge input if PIN not validated
                  }
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3 sm:py-4 text-sm sm:text-base rounded-xl font-bold transition-all hover:scale-105 shadow-lg disabled:shadow-none shadow-green-500/30 disabled:hover:scale-100"
                >
                  Valider l'accès
                </button>
                {isLocked && (
                  <button
                    onClick={resetSystem}
                    className="sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-blue-500/30"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {showAlert && (
              <div className="bg-red-950/80 backdrop-blur-xl border-2 border-red-500 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-red-500/30 animate-in fade-in slide-in-from-top duration-500">
                <div className="flex items-center gap-3">
                  <Bell className="w-7 h-7 sm:w-8 sm:h-8 text-red-400 animate-bounce" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      ALERTE SÉCURITÉ
                    </h3>
                    <p className="text-sm sm:text-base text-red-300">
                      Le système a été verrouillé après plusieurs tentatives
                      échouées
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="xl:col-span-1 space-y-4">
            {/* Statistiques */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                  Statistiques
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={downloadStatistics}
                    className="p-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg transition-all hover:scale-110 shadow-lg"
                    title="Télécharger les statistiques"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {/* Total des logs */}
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                  <div className="text-xs text-gray-400 mb-1">
                    Total des événements
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {accessLog.length}
                  </div>
                </div>

                {/* Statistiques par type */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-700/50">
                    <div className="text-xs text-blue-300 mb-1">Accès</div>
                    <div className="text-xl font-bold text-blue-200">
                      {accessLog.filter((log) => log.type === "Accès").length}
                    </div>
                    <div className="text-xs text-blue-400 mt-1">
                      {
                        accessLog.filter(
                          (log) => log.type === "Accès" && log.success
                        ).length
                      }{" "}
                      réussis
                    </div>
                  </div>

                  <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-700/50">
                    <div className="text-xs text-yellow-300 mb-1">
                      Tentatives
                    </div>
                    <div className="text-xl font-bold text-yellow-200">
                      {
                        accessLog.filter((log) => log.type === "Tentative")
                          .length
                      }
                    </div>
                    <div className="text-xs text-yellow-400 mt-1">
                      {
                        accessLog.filter(
                          (log) => log.type === "Tentative" && !log.success
                        ).length
                      }{" "}
                      échouées
                    </div>
                  </div>

                  <div className="bg-red-900/30 rounded-lg p-3 border border-red-700/50">
                    <div className="text-xs text-red-300 mb-1">Attaques</div>
                    <div className="text-xl font-bold text-red-200">
                      {accessLog.filter((log) => log.type === "Attaque").length}
                    </div>
                    <div className="text-xs text-red-400 mt-1">
                      {
                        accessLog.filter(
                          (log) => log.type === "Attaque" && !log.success
                        ).length
                      }{" "}
                      bloquées
                    </div>
                  </div>

                  <div className="bg-green-900/30 rounded-lg p-3 border border-green-700/50">
                    <div className="text-xs text-green-300 mb-1">Défense</div>
                    <div className="text-xl font-bold text-green-200">
                      {accessLog.filter((log) => log.type === "Défense").length}
                    </div>
                    <div className="text-xs text-green-400 mt-1">
                      {
                        accessLog.filter(
                          (log) => log.type === "Défense" && log.success
                        ).length
                      }{" "}
                      détections
                    </div>
                  </div>
                </div>

                {/* Taux de succès */}
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                  <div className="text-xs text-gray-400 mb-2">
                    Taux de succès
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            accessLog.length > 0
                              ? (accessLog.filter((log) => log.success).length /
                                  accessLog.length) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-white">
                      {accessLog.length > 0
                        ? Math.round(
                            (accessLog.filter((log) => log.success).length /
                              accessLog.length) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                {/* Alertes de sécurité */}
                <div className="bg-orange-900/30 rounded-lg p-3 border border-orange-700/50">
                  <div className="text-xs text-orange-300 mb-1">
                    Alertes de Sécurité
                  </div>
                  <div className="text-xl font-bold text-orange-200">
                    {
                      accessLog.filter(
                        (log) =>
                          log.type === "Sécurité" || log.type === "Défense"
                      ).length
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Journal d'Accès */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 xl:sticky xl:top-4 shadow-2xl border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  Journal d'Accès
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => clearLogs("access")}
                    className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all hover:scale-110 shadow-lg"
                    title="Effacer les logs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => downloadLogs("access", "Journal_Acces")}
                    className="p-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg transition-all hover:scale-110 shadow-lg"
                    title="Télécharger les logs"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-3 max-h-[300px] xl:max-h-[350px] overflow-y-auto custom-scrollbar">
                {accessLog.filter(
                  (log) =>
                    log.type === "Accès" ||
                    log.type === "Tentative" ||
                    log.type === "Système"
                ).length === 0 ? (
                  <div className="text-gray-400 text-center py-8 bg-slate-900/30 rounded-xl">
                    <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Aucun événement enregistré</p>
                  </div>
                ) : (
                  accessLog
                    .filter(
                      (log) =>
                        log.type === "Accès" ||
                        log.type === "Tentative" ||
                        log.type === "Système"
                    )
                    .map((log, index) => (
                      <div
                        key={index}
                        className={`p-3 sm:p-4 rounded-xl border-l-4 backdrop-blur-sm transition-all hover:scale-[1.02] animate-in fade-in slide-in-from-top duration-300 ${
                          log.success
                            ? "bg-green-950/50 border-green-500 hover:bg-green-950/70"
                            : "bg-red-950/50 border-red-500 hover:bg-red-950/70"
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <span className="text-xs text-gray-400 font-mono">
                            {log.timestamp}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-lg shadow-sm ${
                              log.success
                                ? "bg-green-600 text-white"
                                : "bg-red-600 text-white"
                            }`}
                          >
                            {log.type}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-white leading-relaxed">
                          {log.message}
                        </p>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Alertes de Sécurité - Affiche seulement si défense activée */}
            {defensesEnabled && (
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                    Alertes de Sécurité
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => clearLogs("security")}
                      className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all hover:scale-110 shadow-lg"
                      title="Effacer les logs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        downloadLogs("security", "Alertes_Securite")
                      }
                      className="p-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg transition-all hover:scale-110 shadow-lg"
                      title="Télécharger les logs"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3 max-h-[300px] xl:max-h-[350px] overflow-y-auto custom-scrollbar">
                  {accessLog.filter(
                    (log) => log.type === "Sécurité" || log.type === "Défense"
                  ).length === 0 ? (
                    <div className="text-gray-400 text-center py-8 bg-slate-900/30 rounded-xl">
                      <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Aucune alerte enregistrée</p>
                    </div>
                  ) : (
                    accessLog
                      .filter(
                        (log) =>
                          log.type === "Sécurité" || log.type === "Défense"
                      )
                      .map((log, index) => (
                        <div
                          key={index}
                          className={`p-3 sm:p-4 rounded-xl border-l-4 backdrop-blur-sm transition-all hover:scale-[1.02] animate-in fade-in slide-in-from-top duration-300 ${
                            log.success
                              ? "bg-green-950/50 border-green-500 hover:bg-green-950/70"
                              : "bg-red-950/50 border-red-500 hover:bg-red-950/70"
                          }`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <span className="text-xs text-gray-400 font-mono">
                              {log.timestamp}
                            </span>
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded-lg shadow-sm ${
                                log.success
                                  ? "bg-green-600 text-white"
                                  : "bg-red-600 text-white"
                              }`}
                            >
                              {log.type}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-white leading-relaxed">
                            {log.message}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}

            {/* Attaques - Affiche seulement si panneau d'attaques ouvert */}
            {showAttackPanel && (
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <Sword className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                    Attaques
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => clearLogs("attack")}
                      className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all hover:scale-110 shadow-lg"
                      title="Effacer les logs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3 max-h-[300px] xl:max-h-[350px] overflow-y-auto custom-scrollbar">
                  {accessLog.filter((log) => log.type === "Attaque").length ===
                  0 ? (
                    <div className="text-gray-400 text-center py-8 bg-slate-900/30 rounded-xl">
                      <Sword className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Aucune attaque enregistrée</p>
                    </div>
                  ) : (
                    accessLog
                      .filter((log) => log.type === "Attaque")
                      .map((log, index) => (
                        <div
                          key={index}
                          className={`p-3 sm:p-4 rounded-xl border-l-4 backdrop-blur-sm transition-all hover:scale-[1.02] animate-in fade-in slide-in-from-top duration-300 ${
                            log.success
                              ? "bg-green-950/50 border-green-500 hover:bg-green-950/70"
                              : "bg-red-950/50 border-red-500 hover:bg-red-950/70"
                          }`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <span className="text-xs text-gray-400 font-mono">
                              {log.timestamp}
                            </span>
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded-lg shadow-sm ${
                                log.success
                                  ? "bg-green-600 text-white"
                                  : "bg-red-600 text-white"
                              }`}
                            >
                              {log.type}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-white leading-relaxed">
                            {log.message}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
