"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import {
  BookOpen,
  Briefcase,
  ClipboardList,
  PlayCircle,
  Copy,
  RotateCcw,
  Sparkles,
  Wifi,
  Shield,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

/**
 * ✅ CLEAN VERSION (Wi-Fi Router ONLY)
 * - Removed Mobile Phone (types, presets, checklist, mode switch)
 * - Keeps: scoring, checklist, missing list, generated brief, language + theme toggle
 *
 * Put this file at: app/page.tsx
 */

/* ------------------ Dark Mode ------------------ */

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/* ------------------ Score Circle ------------------ */

function CircleScore({
  value,
  size = 120,
  stroke = 10,
}: {
  value: number;
  size?: number;
  stroke?: number;
}) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const gapPct = 0.08;
  const dash = c * (1 - gapPct);
  const offset = dash * (1 - v / 100);

  return (
    <div className="rounded-2xl p-4 flex items-center justify-center bg-sky-100 dark:bg-sky-950/40">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            className="stroke-white/80 dark:stroke-white/10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            strokeDashoffset={0}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            className="stroke-sky-500 dark:stroke-sky-400"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            strokeDashoffset={offset}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-sky-600 dark:text-sky-300 text-4xl font-bold leading-none">
            {v}%
          </div>
          <div className="mt-3 flex flex-col items-center gap-2">
            <div className="h-1 w-10 rounded-full bg-sky-500/70 dark:bg-sky-400/60" />
            <div className="h-1 w-6 rounded-full bg-sky-500/70 dark:bg-sky-400/60" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------ Types ------------------ */

type Lang = "en" | "km";
type Group = "GV" | "ID" | "PR" | "DE" | "RS" | "RC";

type SimTextFields = {
  systemType: string;
  hardware: string;
  software: string;
  data: string;
  privacy: string;
  metric: string;
  alignment: string;
};

type RouterChecks = {
  // GV
  gv_rolesDefined: boolean;
  gv_vendorUpdates: boolean;
  gv_dataPolicy: boolean;
  gv_accountRecovery: boolean;

  // ID
  id_inventory: boolean;
  id_networkMap: boolean;
  id_dataInventory: boolean;
  id_riskScenarios: boolean;

  // ✅ NEW (Reliability planning)
  id_coveragePlan: boolean;

  // PR
  pr_strongPasswords: boolean;
  pr_mfa: boolean;
  pr_noDefaultCreds: boolean;
  pr_autoUpdates: boolean;
  pr_secureConfig: boolean;
  pr_networkIsolation: boolean;
  pr_noPortForward: boolean;
  pr_encryptRetention: boolean;

  // ✅ NEW (CISA explicit hardening)
  pr_disableWPS: boolean;
  pr_disableUPnP: boolean;
  pr_ssidNoPersonalInfo: boolean;
  pr_physicalSecurity: boolean;

  // ✅ NEW (Reliability/Performance)
  pr_channelPlan: boolean;
  pr_qosPolicy: boolean;

  // ✅ NEW (Power/Availability)
  pr_powerProtection: boolean;

  // DE
  de_alerts: boolean;
  de_deviceHealth: boolean;
  de_logReview: boolean;

  // ✅ NEW (Performance monitoring)
  de_performanceMonitoring: boolean;

  // RS
  rs_takeoverPlan: boolean;
  rs_isolationPlan: boolean;

  // RC
  rc_backupAccess: boolean;
  rc_rebuildSteps: boolean;

  // ✅ NEW (Backup connectivity)
  rc_backupInternet: boolean;
};


type SimForm = SimTextFields & {
  checks: RouterChecks;
};

/* ------------------ SDG 9 ------------------ */

type Sdg9 = {
  id: "9";
  title: string;
  titleKm: string;
  color: string;
  topic: string;
  topicKm: string;
  link: { label: string; url: string };
};

const SDG9: Sdg9 = {
  id: "9",
  title: "Industry, Innovation and Infrastructure",
  titleKm: "ឧស្សាហកម្ម នវានុវត្តន៍ និងហេដ្ឋារចនាសម្ព័ន្ធ",
  color: "#FD6925",
  topic: "WI-FI Router",
  topicKm: "រ៉ោតទ័រ WI-FI",
  link: { label: "UN SDG 9 overview", url: "https://sdgs.un.org/goals/goal9" },
};

function toggleLang(current: Lang): Lang {
  return current === "en" ? "km" : "en";
}

/* ------------------ Text ------------------ */

const TEXT = {
  en: {
    appTitle: "Home Router Security Checklist",
    appSubtitle: "",
    language: "Language",
    tabs: { about: "About", process: "Process", sim: "Simulator" },
    aboutTitle: "Why SDG 9 fits (with NIST CSF)",
    aboutBody:
      "SDG 9 focuses on resilient infrastructure. A secure Wi-Fi router is part of modern digital infrastructure. This simulator follows the NIST Cybersecurity Framework (CSF): Govern (ownership, policies, updates), Identify (devices, data, risks), Protect (auth, secure config, segmentation, encryption), Detect (alerts, logs), Respond (contain incidents and rotate credentials), and Recover (backup, restore, rebuild). The checklist score reflects reliability, safety, and continuity—key outcomes of SDG 9.",
    processTitle: "Simple implementation process",
    processSteps: [
      "Go to the Simulator tab (Wi-Fi Router is selected).",
      "Tick checklist controls.",
      "Score updates instantly → Copy Brief.",
    ],
    simTitle: "Wi-Fi Simulator",
    simSub: "Tick controls. Score updates instantly.",
    passRule: "Pass = required inputs (auto-filled) + score ≥ 80.",
    fields: {
      systemType: "System type",
      hardware: "Hardware",
      software: "Software",
      data: "Data collected",
      privacy: "Security/privacy controls",
      metric: "KPIs (metrics)",
      alignment: "SDG alignment",
    } satisfies Record<keyof SimTextFields, string>,
    buttons: {
      reset: "Reset",
      copy: "Copy Brief",
      essentials: "Auto-check essentials",
    },
    sections: {
      checklist: "Checklist",
      checklistSub: "Tick what you implemented. More ticks = higher score.",
      brief: "Summary Informations",
    },
    tip: "DSE 2025",
    copied: "Copied!",
    router: "Wi-Fi Router",
    inputsFromChecklist: "Inputs (from checklist)",
    uncheckedControls: "Unchecked controls",
  },
  km: {
    appTitle: "Home Router Security Checklist",
    appSubtitle: "Wi-Fi Router Checklist & Scoring",
    language: "ភាសា",
    tabs: { about: "អំពី", process: "ដំណើរការ", sim: "Simulator" },
    aboutTitle: "ហេតុអ្វី SDG 9 សមស្រប",
    aboutBody:
      "SDG 9 ផ្តោតលើហេដ្ឋារចនាសម្ព័ន្ធរឹងមាំ។ Wi-Fi Router មានសុវត្ថិភាពគឺជាផ្នែកសំខាន់នៃហេដ្ឋារចនាសម្ព័ន្ធឌីជីថល។ ស៊ីម្យូលេសិននេះអនុវត្តតាម NIST CSF៖ Govern, Identify, Protect, Detect, Respond, Recover។ ពិន្ទុ checklist បង្ហាញភាពអាចទុកចិត្តបាន សុវត្ថិភាព និងភាពបន្ត—ស្របនឹង SDG 9។",
    processTitle: "ដំណើរការអនុវត្តងាយៗ",
    processSteps: ["ទៅ Simulator (Wi-Fi Router បានជ្រើសរួច)", "ចុច checklist", "ពិន្ទុប្តូរភ្លាមៗ → ចម្លង brief"],
    simTitle: "Wi-Fi Simulator",
    simSub: "ចុច controls → ពិន្ទុប្តូរភ្លាមៗ។",
    passRule: "ជាប់ = inputs (auto) + ពិន្ទុ ≥ 80។",
    fields: {
      systemType: "ប្រភេទប្រព័ន្ធ",
      hardware: "ហារដវែរ",
      software: "សូហ្វវែរ",
      data: "ទិន្នន័យប្រមូល",
      privacy: "ការការពារ/ឯកជនភាព",
      metric: "KPIs (សូចនាករ)",
      alignment: "ការភ្ជាប់ទៅ SDG",
    } satisfies Record<keyof SimTextFields, string>,
    buttons: {
      reset: "កំណត់ឡើងវិញ",
      copy: "ចម្លងពត៌មានសង្ខេប",
      essentials: "ចុច Essentials ស្វ័យប្រវត្តិ",
    },
    sections: {
      checklist: "Checklist",
      checklistSub: "ចុចអ្វីដែលអ្នកបានអនុវត្ត។ ចុចច្រើន = ពិន្ទុខ្ពស់។",
      brief: "ពត៌មានសង្ខេប",
    },
    tip: "DSE 2025",
    copied: "បានចម្លង!",
    router: "Wi-Fi Router",
    inputsFromChecklist: "Inputs (ពី checklist)",
    uncheckedControls: "Controls មិនទាន់ចុច",
  },
} as const;

/* ------------------ Flag ------------------ */

function FlagIcon({ lang }: { lang: Lang }) {
  const src =
    lang === "en"
      ? "https://hatscripts.github.io/circle-flags/flags/us.svg"
      : "https://hatscripts.github.io/circle-flags/flags/kh.svg";

  return <img src={src} alt={lang} className="h-5 w-5 rounded-full" loading="lazy" />;
}

/* ------------------ Checklist Data ------------------ */

type RouterItem = {
  key: keyof RouterChecks;
  group: Group;
  labelEn: string;
  labelKm: string;
};

const ROUTER_ITEMS: RouterItem[] = [
  // GV — Govern
  {
    key: "gv_rolesDefined",
    group: "GV",
    labelEn:
      "Authorized admin owner + no shared admin (only trusted users can change router settings)",
    labelKm:
      "កំណត់ម្ចាស់ admin + មិនប្រើ admin រួម (មានតែអ្នកទុកចិត្តអាចប្ដូរ settings router)",
  },
  {
    key: "gv_vendorUpdates",
    group: "GV",
    labelEn:
      "Vendor/ISP lifecycle + update policy (support window, update method, who is responsible for patching)",
    labelKm:
      "វដ្ដជីវិត/គាំទ្រ + គោលការណ៍អាប់ដេតពី vendor/ISP (គាំទ្ររយៈពេល, វិធីអាប់ដេត, អ្នកទទួលខុសត្រូវ patch)",
  },
  {
    key: "gv_dataPolicy",
    group: "GV",
    labelEn:
      "Secure baseline documented (approved settings standard; disable unnecessary features/interfaces by default)",
    labelKm:
      "កត់ត្រា baseline សុវត្ថិភាព (ស្តង់ដារ settings; បិទ features/interfaces មិនចាំបាច់តាមលំនាំដើម)",
  },
  {
    key: "gv_accountRecovery",
    group: "GV",
    labelEn:
      "Recovery/reset governance (secure factory reset steps + protect admin recovery info from misuse)",
    labelKm:
      "គោលការណ៍ស្ដារ/reset (ជំហាន factory reset មានសុវត្ថិភាព + ការពារ recovery info មិនឲ្យត្រូវបំពាន)",
  },

  // ID — Identify
  {
    key: "id_inventory",
    group: "ID",
    labelEn:
      "Router identification recorded (model/serial + firmware version for tracking and audits)",
    labelKm: "កត់ត្រា router (model/serial + version firmware សម្រាប់តាមដាន និង audit)",
  },
  {
    key: "id_networkMap",
    group: "ID",
    labelEn:
      "Network topology documented (WAN/LAN/Guest/IoT/VLAN + where admin access is allowed from)",
    labelKm:
      "កត់ត្រា topology បណ្ដាញ (WAN/LAN/Guest/IoT/VLAN + កន្លែងអនុញ្ញាតចូល admin)",
  },
  {
    key: "id_dataInventory",
    group: "ID",
    labelEn:
      "Connected device inventory maintained (approved list; identify unknown devices quickly)",
    labelKm:
      "រក្សាបញ្ជីឧបករណ៍ភ្ជាប់ (approved list; រកឃើញ unknown devices ឲ្យលឿន)",
  },
  {
    key: "id_riskScenarios",
    group: "ID",
    labelEn:
      "Attack surface review (remote admin, open ports, UPnP/WPS, unused services/features minimized)",
    labelKm:
      "ពិនិត្យ surface វាយប្រហារ (remote admin, ports បើក, UPnP/WPS, កាត់បន្ថយ services/features មិនប្រើ)",
  },

  // ✅ NEW — Reliability planning (coverage)
  {
    key: "id_coveragePlan",
    group: "ID",
    labelEn:
      "Wi-Fi coverage plan (router/AP placement avoids dead zones; basic layout documented)",
    labelKm:
      "ផែនការគ្របដណ្តប់សញ្ញា (ដាក់ router/AP ឲ្យជៀស dead zone; កត់ត្រាផែនទីសាមញ្ញ)",
  },

  // PR — Protect
  {
    key: "pr_strongPasswords",
    group: "PR",
    labelEn: "Strong admin credentials (unique long password; change if risk suspected)",
    labelKm: "Credentials admin ខ្លាំង (password វែង និងមិនស្ទួន; ប្ដូរពេលសង្ស័យហានិភ័យ)",
  },
  {
    key: "pr_mfa",
    group: "PR",
    labelEn:
      "Admin access hardened (disable WAN/remote admin; manage from LAN only; use VPN if remote is needed)",
    labelKm:
      "តឹងការចូល admin (បិទ WAN/remote admin; អនុញ្ញាតតែ LAN; ប្រើ VPN បើចាំបាច់ពីចម្ងាយ)",
  },
  {
    key: "pr_noDefaultCreds",
    group: "PR",
    labelEn: "No default credentials (change default admin + Wi-Fi SSID/password)",
    labelKm: "មិនប្រើ default creds (ប្ដូរ admin login + Wi-Fi SSID/password)",
  },
  {
    key: "pr_autoUpdates",
    group: "PR",
    labelEn:
      "Secure firmware updates (auto-update or scheduled patching; prefer vendor-signed firmware)",
    labelKm:
      "អាប់ដេត firmware សុវត្ថិភាព (auto ឬ schedule; ជ្រើស firmware signed/verified ពី vendor)",
  },
  {
    key: "pr_secureConfig",
    group: "PR",
    labelEn: "Secure baseline config (disable WPS/UPnP; disable WEP/TKIP; use WPA2/WPA3)",
    labelKm: "Baseline config សុវត្ថិភាព (បិទ WPS/UPnP; បិទ WEP/TKIP; ប្រើ WPA2/WPA3)",
  },
  {
    key: "pr_networkIsolation",
    group: "PR",
    labelEn:
      "Network segmentation (Guest Wi-Fi / IoT VLAN; keep admin devices on trusted segment)",
    labelKm: "បំបែកបណ្ដាញ (Guest Wi-Fi / IoT VLAN; ដាក់ admin devices នៅ segment ទុកចិត្ត)",
  },
  {
    key: "pr_noPortForward",
    group: "PR",
    labelEn:
      "Inbound access restricted (avoid port forwarding; if required, document/limit and review regularly)",
    labelKm:
      "កំណត់ inbound access (ជៀស port forwarding; បើចាំបាច់ ត្រូវកត់ត្រា/កំណត់តឹង និងពិនិត្យជាប្រចាំ)",
  },
  {
    key: "pr_encryptRetention",
    group: "PR",
    labelEn:
      "Secure management & data handling (HTTPS admin UI; backup config safely; minimize retained logs/data)",
    labelKm:
      "ការពារ management & ទិន្នន័យ (HTTPS admin UI; backup config សុវត្ថិភាព; រក្សា logs/data លើឧបករណ៍ឲ្យតិច)",
  },

  // ✅ NEW — CISA-style home Wi-Fi hardening (extra clarity)
  {
    key: "pr_ssidNoPersonalInfo",
    group: "PR",
    labelEn: "Wi-Fi name (SSID) does NOT include personal information (name/address/unit)",
    labelKm: "ឈ្មោះ Wi-Fi (SSID) មិនបញ្ចូលព័ត៌មានផ្ទាល់ខ្លួន (ឈ្មោះ/អាសយដ្ឋាន/លេខបន្ទប់)",
  },
  {
    key: "pr_physicalSecurity",
    group: "PR",
    labelEn: "Router placed in a secure physical location (not easy for others to access/reset)",
    labelKm: "ដាក់ router កន្លែងមានសុវត្ថិភាព (មិនងាយឲ្យអ្នកផ្សេងប៉ះ/ចុច reset)",
  },

  // ✅ NEW — Reliability/Performance
  {
    key: "pr_channelPlan",
    group: "PR",
    labelEn: "Channel/interference tuned (2.4/5GHz optimized; avoid congested channels)",
    labelKm: "កែ channel/រំខានសញ្ញា (optimize 2.4/5GHz; ជៀស channel កកស្ទះ)",
  },
  {
    key: "pr_qosPolicy",
    group: "PR",
    labelEn: "QoS/traffic priority set (video calls/learning/work get priority if needed)",
    labelKm: "កំណត់ QoS/អាទិភាព traffic (video call/រៀន/ការងារ មានអាទិភាពបើចាំបាច់)",
  },

  // ✅ NEW — Power/Availability
  {
    key: "pr_powerProtection",
    group: "PR",
    labelEn: "Power protection (surge protector or UPS for router/modem to reduce outages and damage)",
    labelKm: "ការពារថាមពល (surge protector ឬ UPS សម្រាប់ router/modem ដើម្បីកាត់បន្ថយដាច់ភ្លើង និងខូចខាត)",
  },

  // DE — Detect
  {
    key: "de_alerts",
    group: "DE",
    labelEn:
      "Alerts/logs enabled (admin logins, config changes, new device joins, update events where supported)",
    labelKm: "បើក alerts/logs (admin logins, ប្ដូរ config, ឧបករណ៍ថ្មីចូល, update events បើគាំទ្រ)",
  },
  {
    key: "de_deviceHealth",
    group: "DE",
    labelEn:
      "Detect unknown devices (monitor joins; quickly block/kick rogue devices; review client list)",
    labelKm: "រកឃើញឧបករណ៍មិនស្គាល់ (តាមដានការភ្ជាប់; អាច block/kick បានលឿន; ពិនិត្យ client list)",
  },
  {
    key: "de_logReview",
    group: "DE",
    labelEn:
      "Log review routine (review regularly; export to syslog/cloud/screenshot if logging is limited)",
    labelKm:
      "របៀបពិនិត្យ logs (ពិនិត្យជាប្រចាំ; export ទៅ syslog/cloud/ថតរូប ប្រសិនបើ logs មានកម្រិត)",
  },

  // ✅ NEW — Monitor reliability metrics
  {
    key: "de_performanceMonitoring",
    group: "DE",
    labelEn: "Performance monitoring routine (monthly speed/latency test; record results for trends)",
    labelKm: "តាមដាន performance (តេស្ត speed/latency ប្រចាំខែ; កត់ត្រាលទ្ធផលសម្រាប់មើល trend)",
  },

  // RS — Respond
  {
    key: "rs_takeoverPlan",
    group: "RS",
    labelEn:
      "Incident response actions (rotate admin/Wi-Fi passwords; disable remote admin/UPnP; patch firmware; review devices)",
    labelKm:
      "សកម្មភាពឆ្លើយតប (ប្ដូរ admin/Wi-Fi passwords; បិទ remote admin/UPnP; patch firmware; ពិនិត្យ devices)",
  },
  {
    key: "rs_isolationPlan",
    group: "RS",
    labelEn:
      "Containment steps (block device; isolate IoT/Guest; disable SSID temporarily; export logs for investigation)",
    labelKm:
      "ជំហានទប់ស្កាត់ (block device; ផ្ដាច់ IoT/Guest; បិទ SSID បណ្ដោះអាសន្ន; export logs សម្រាប់ស៊ើបអង្កេត)",
  },

  // RC — Recover
  {
    key: "rc_backupAccess",
    group: "RC",
    labelEn: "Recovery material stored safely (config backup + admin recovery info protected/offline)",
    labelKm: "រក្សា recovery material ឲ្យសុវត្ថិភាព (backup config + recovery info ការពារ/ទុកក្រៅបណ្ដាញ)",
  },
  {
    key: "rc_rebuildSteps",
    group: "RC",
    labelEn:
      "Rebuild playbook (factory reset → secure baseline → segmentation → update firmware → verify alerts/logs)",
    labelKm:
      "ផែនការស្ដារ (factory reset → baseline សុវត្ថិភាព → segmentation → update firmware → បញ្ជាក់ alerts/logs)",
  },

  // ✅ NEW — Backup internet / failover
  {
    key: "rc_backupInternet",
    group: "RC",
    labelEn: "Backup connectivity plan (4G/5G hotspot/failover ready; steps documented for downtime)",
    labelKm: "ផែនការបណ្ដាញបម្រុង (hotspot/failover 4G/5G ត្រៀមរួច; កត់ត្រាជំហានពេលបណ្ដាញដាច់)",
  },
];


const EMPTY_CHECKS: RouterChecks = Object.fromEntries(
  ROUTER_ITEMS.map((i) => [i.key, false])
) as RouterChecks;

/* ------------------ Preset (Wi-Fi Router only) ------------------ */

const PRESET: SimForm = {
  systemType: "Home IoT security system + dashboard",
  hardware: "Wi-Fi router",
  software:
    "Web dashboard UI, Backend API, Authentication (login), Alerts (push/SMS/email), Audit logs, Device management",
  data: "Login/audit logs, Alerts history, Device health (offline)",
  privacy:
    "TLS/HTTPS, Strong password policy, No default credentials, Auto updates/patching, No port forwarding",
  metric: "Uptime %, Patch compliance %, Alert latency, MTTR",
  alignment: "Resilient infrastructure (SDG 9)",
  checks: { ...EMPTY_CHECKS },
};

/* ------------------ UI Bits ------------------ */

function SectionTitle({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-9 w-9 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );
}

function RowCheck({
  checked,
  onCheckedChange,
  title,
  group,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  title: string;
  group: Group;
}) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border p-3 cursor-pointer select-none hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="mt-1 h-4 w-4"
      />
      <div className="space-y-0.5">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-[11px] text-muted-foreground">{group}</div>
      </div>
    </label>
  );
}

function ChecklistLine({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-start gap-2">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 mt-0.5" />
      ) : (
        <AlertTriangle className="h-4 w-4 mt-0.5" />
      )}
      <div className={ok ? "text-sm" : "text-sm text-muted-foreground"}>{label}</div>
    </div>
  );
}

/* ------------------ Scoring ------------------ */

function requiredFields(): (keyof SimTextFields)[] {
  return ["systemType", "hardware", "software", "data", "privacy", "metric"];
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function evaluateSystem(f: SimForm) {
  const required = requiredFields();
  const missingRequired = required.filter((k) => !String(f[k] ?? "").trim());

  const reqDone = required.length - missingRequired.length;
  const reqScore = Math.round((reqDone / required.length) * 60);

  const items = ROUTER_ITEMS;
  const missingControls = items.filter((i) => !f.checks[i.key]);
  const ctlDone = items.length - missingControls.length;
  const ctlScore = Math.round((ctlDone / items.length) * 40);

  const score = clamp(reqScore + ctlScore, 0, 100);
  const passed = missingRequired.length === 0 && score >= 80;

  return { score, passed, missingRequired, items, missingControls };
}

/* ------------------ Brief ------------------ */

function groupLabel(group: Group) {
  switch (group) {
    case "GV":
      return "Govern";
    case "ID":
      return "Identify";
    case "PR":
      return "Protect";
    case "DE":
      return "Detect";
    case "RS":
      return "Respond";
    case "RC":
      return "Recover";
  }
}

function buildBrief(lang: Lang, f: SimForm, r: ReturnType<typeof evaluateSystem>) {
  const t = TEXT[lang];
  const L = t.fields;

  const statusLine =
    lang === "en"
      ? `Status: ${r.passed ? "PASSED" : "NOT PASSED"} · Score: ${r.score}/100`
      : `ស្ថានភាព៖ ${r.passed ? "ជាប់" : "មិនជាប់"} · ពិន្ទុ៖ ${r.score}/100`;

  const checked = ROUTER_ITEMS.filter((i) => f.checks[i.key]).map((i) =>
    lang === "en"
      ? `- [x] ${groupLabel(i.group)}: ${i.labelEn}`
      : `- [x] ${groupLabel(i.group)}: ${i.labelKm}`
  );

  const missingCtl = r.missingControls.map((i) =>
    lang === "en"
      ? `- [ ] ${groupLabel(i.group)}: ${i.labelEn}`
      : `- [ ] ${groupLabel(i.group)}: ${i.labelKm}`
  );

  const missingReq = r.missingRequired.map((k) => `- ${L[k]}`);

  const derived =
    lang === "en"
      ? [
          `- Hardware: ${t.router}`,
          `- Architecture: Device → Network/Gateway → Dashboard (app/server)`,
          `- Data handling: ${f.data}`,
          `- Security controls: ${f.privacy}`,
          `- KPIs: ${f.metric}`,
        ]
      : [
          `- Hardware: ${t.router}`,
          `- ស្ថាបត្យកម្ម: Device → Network/Gateway → Dashboard (app/server)`,
          `- ទិន្នន័យ: ${f.data}`,
          `- ការការពារ: ${f.privacy}`,
          `- KPIs: ${f.metric}`,
        ];

  return [
    lang === "en"
      ? `Project: SDG 9 Security System (${t.router})`
      : `គម្រោង៖ ប្រព័ន្ធសុវត្ថិភាព SDG 9 (${t.router})`,
    statusLine,
    "",
    "## Detailed summary",
    ...derived,
    "",
    "## Inputs (auto-filled)",
    `- ${L.systemType}: ${f.systemType}`,
    `- ${L.hardware}: ${f.hardware}`,
    `- ${L.software}: ${f.software}`,
    `- ${L.data}: ${f.data}`,
    `- ${L.privacy}: ${f.privacy}`,
    `- ${L.metric}: ${f.metric}`,
    `- ${L.alignment}: ${f.alignment}`,
    "",
    "## Checklist (checked)",
    ...(checked.length ? checked : [lang === "en" ? "- (none)" : "- (មិនមាន)"]),
    "",
    "## Checklist (missing)",
    ...(missingCtl.length ? missingCtl : [lang === "en" ? "- (none)" : "- (មិនមាន)"]),
    r.missingRequired.length ? ["", "## Missing required inputs", ...missingReq] : "",
  ]
    .flat()
    .filter((x) => x !== "")
    .join("\n");
}

/* ------------------ Essentials ------------------ */

const ROUTER_ESSENTIALS: (keyof RouterChecks)[] = [
  "pr_noDefaultCreds",
  "pr_strongPasswords",
  "pr_secureConfig",
  "pr_autoUpdates",
  "pr_mfa",
  "pr_networkIsolation",
  "pr_noPortForward",
  "de_alerts",
  "de_logReview",

  // ✅ recommended adds
  "pr_disableWPS", // only if you keep WPS separately (you currently bundle in pr_secureConfig)
  "pr_disableUPnP", // same note as above
  "pr_ssidNoPersonalInfo",
  "pr_physicalSecurity",
  "pr_powerProtection",
  "de_performanceMonitoring",
];


const TARGET_SCORE = 80;

/* ------------------ Simulator ------------------ */

function Simulator({ lang }: { lang: Lang }) {
  const t = TEXT[lang];

  const [form, setForm] = useState<SimForm>(() => PRESET);

  const result = useMemo(() => evaluateSystem(form), [form]);
  const brief = useMemo(() => buildBrief(lang, form, result), [lang, form, result]);

  const selectedInputLabels = useMemo(() => {
    return ROUTER_ITEMS.filter((i) => form.checks[i.key]).map((i) => ({
      key: String(i.key),
      group: i.group,
      label: lang === "en" ? i.labelEn : i.labelKm,
    }));
  }, [form, lang]);

  const inputMissing = selectedInputLabels.length === 0;

  const toggleCheck = (k: keyof RouterChecks, v: boolean) =>
    setForm((s) => ({ ...s, checks: { ...s.checks, [k]: v } }));

  const reset = () => setForm(PRESET);

  const applyEssentials = () => {
    setForm((s) => {
      // essentials first, then rest in checklist order
      const order: (keyof RouterChecks)[] = [
        ...ROUTER_ESSENTIALS,
        ...ROUTER_ITEMS.map((i) => i.key).filter((k) => !ROUTER_ESSENTIALS.includes(k)),
      ];

      const nextChecks = { ...s.checks };
      let draft: SimForm = { ...s, checks: nextChecks };

      for (const k of order) {
        if (evaluateSystem(draft).score >= TARGET_SCORE) break;
        if (!nextChecks[k]) {
          nextChecks[k] = true;
          draft = { ...draft, checks: nextChecks };
        }
      }

      return draft;
    });
  };

  const [copied, setCopied] = useState(false);

  const copyBrief = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(brief);
      } else {
        const ta = document.createElement("textarea");
        ta.value = brief;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const reqMissing = result.missingRequired.length;
  const ctlMissing = result.missingControls.length;
  const items = ROUTER_ITEMS;
  const groups: Group[] = ["GV", "ID", "PR", "DE", "RS", "RC"];

  const checkedCount = ROUTER_ITEMS.filter((i) => form.checks[i.key]).length;

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <SectionTitle icon={PlayCircle} title={t.simTitle} />
              <p className="text-sm text-muted-foreground">{t.simSub}</p>
            </div>

            {/* ✅ No hardware selector — Wi-Fi Router only */}
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:justify-end">
              <div className="w-full md:w-auto">
                {/* <div className="h-10 rounded-2xl border bg-background/60 dark:bg-background/40 px-3 flex items-center gap-2 shadow-sm">
                  <Wifi className="h-4 w-4 opacity-80" />
                  <span className="text-sm font-medium">{t.router}</span>
                </div> */}
              </div>

              <div className="w-full md:w-auto">
                <div className="grid grid-cols-2 gap-2 md:flex md:flex-nowrap md:justify-end">
                  <Button
                    variant="secondary"
                    className="h-10 w-full rounded-xl md:w-auto shadow-none"
                    onClick={reset}
                  >
                    <RotateCcw className="h-4 w-4 sm:mr-2 opacity-80" />
                    <span className="hidden sm:inline">{t.buttons.reset}</span>
                    <span className="sr-only sm:hidden">{t.buttons.reset}</span>
                  </Button>

                  <Button
                    variant="secondary"
                    title={t.buttons.essentials}
                    className="h-10 w-full rounded-xl md:w-auto shadow-none"
                    onClick={applyEssentials}
                  >
                    <Sparkles className="h-4 w-4 sm:mr-2 opacity-80" />
                    <span className="hidden sm:inline">{t.buttons.essentials}</span>
                    <span className="sr-only sm:hidden">{t.buttons.essentials}</span>
                  </Button>

                  <Button
                    className="h-10 w-full rounded-xl col-span-2 md:col-span-1 md:w-auto shadow-none"
                    onClick={copyBrief}
                  >
                    <Copy className="h-4 w-4 sm:mr-2 opacity-80" />
                    <span className="hidden sm:inline">
                      {copied ? t.copied : t.buttons.copy}
                    </span>
                    <span className="sr-only sm:hidden">
                      {copied ? t.copied : t.buttons.copy}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1 rounded-2xl border p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{t.router}</div>
                <Badge
                  variant={result.passed ? "default" : "secondary"}
                  className="rounded-full"
                >
                  {result.score}/100
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground mt-1">{t.passRule}</div>

              <div className="mt-3">
                <div className="sm:hidden">
                  <CircleScore value={result.score} size={104} stroke={10} />
                </div>
                <div className="hidden sm:block">
                  <CircleScore value={result.score} size={120} stroke={10} />
                </div>
              </div>
            </div>

            {/* Score + summary + missing lists */}
            <div className="md:col-span-2 rounded-2xl border p-3 space-y-2">
              <ChecklistLine
                ok={reqMissing === 0}
                label={
                  lang === "en"
                    ? reqMissing === 0
                      ? "Inputs complete (auto-filled)"
                      : `Missing inputs: ${reqMissing}`
                    : reqMissing === 0
                    ? "Inputs ពេញលេញ (auto)"
                    : `Inputs ខ្វះ: ${reqMissing}`
                }
              />
              <ChecklistLine
                ok={ctlMissing === 0}
                label={
                  lang === "en"
                    ? ctlMissing === 0
                      ? `Checklist complete (${checkedCount}/${items.length})`
                      : `Unchecked controls: ${ctlMissing} (${checkedCount}/${items.length})`
                    : ctlMissing === 0
                    ? `Checklist ពេញលេញ (${checkedCount}/${items.length})`
                    : `Controls ខ្វះ: ${ctlMissing} (${checkedCount}/${items.length})`
                }
              />
              <ChecklistLine
                ok={result.score >= 80}
                label={
                  lang === "en"
                    ? `Target score ≥ 80 (current: ${result.score})`
                    : `គោលដៅ ≥ 80 (បច្ចុប្បន្ន: ${result.score})`
                }
              />

              {(reqMissing > 0 || ctlMissing > 0) && (
                <>
                  <Separator className="my-3" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Inputs (from checklist) */}
                    <div className="rounded-2xl border bg-background p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold">{t.inputsFromChecklist}</div>

                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-muted-foreground">
                          {inputMissing
                            ? lang === "en"
                              ? "0 selected"
                              : "មិនទាន់ជ្រើស"
                            : `${selectedInputLabels.length} ${
                                lang === "en" ? "selected" : "បានជ្រើស"
                              }`}
                        </span>
                      </div>

                      <div className="mt-3">
                        {inputMissing ? (
                          <div className="text-[11px] sm:text-sm text-muted-foreground italic">
                            {lang === "en"
                              ? "No inputs yet. Check items in the checklist to add them here."
                              : "មិនទាន់មាន inputs។ សូមចុច checklist ដើម្បីបន្ថែម។"}
                          </div>
                        ) : (
                          <ul className="space-y-2 text-[11px] sm:text-sm text-muted-foreground max-h-[220px] overflow-auto pr-1">
                            {selectedInputLabels.map((x) => (
                              <li key={x.key} className="flex gap-2 items-start">
                                <CheckCircle2 className="h-4 w-4 mt-0.5" />
                                <span className="break-words">
                                  <span className="text-muted-foreground">{x.group} · </span>
                                  {x.label}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Unchecked controls */}
                    <div className="rounded-2xl border bg-background p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold">{t.uncheckedControls}</div>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-muted-foreground">
                          {ctlMissing}
                        </span>
                      </div>

                      <div className="mt-3">
                        {ctlMissing > 0 ? (
                          <ul className="space-y-2 text-[11px] sm:text-sm text-muted-foreground max-h-[220px] overflow-auto pr-1">
                            {result.missingControls.map((i) => (
                              <li key={String(i.key)} className="flex gap-2">
                                <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
                                <span className="break-words">
                                  {lang === "en" ? i.labelEn : i.labelKm}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-[11px] sm:text-sm text-muted-foreground italic">
                            {lang === "en" ? "All controls checked." : "Controls ពេញលេញ។"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t.sections.checklist}
          </CardTitle>
          <CardDescription>{t.sections.checklistSub}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {groups.map((g) => {
            const groupItems = items.filter((i) => i.group === g);
            if (groupItems.length === 0) return null;

            const groupChecked = groupItems.filter((i) => form.checks[i.key]).length;

            return (
              <div key={g} className="rounded-2xl border p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">
                    {groupLabel(g)}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({groupChecked}/{groupItems.length})
                    </span>
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    {g}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupItems.map((i) => (
                    <RowCheck
                      key={String(i.key)}
                      checked={form.checks[i.key]}
                      onCheckedChange={(v) => toggleCheck(i.key, v)}
                      title={lang === "en" ? i.labelEn : i.labelKm}
                      group={i.group}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Brief */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t.sections.brief}
          </CardTitle>
          <CardDescription>
            {lang === "en"
              ? "Generated from Wi-Fi Router + checklist."
              : "បានបង្កើតពី Wi-Fi Router + checklist។"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
            {brief}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------ Page ------------------ */

export default function Page() {
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<Theme>("light");

  const fontClass = lang === "km" ? "font-khmer" : "font-sans";

  React.useEffect(() => {
    applyTheme(theme);
    document.documentElement.lang = lang;
  }, [theme, lang]);

  const t = TEXT[lang];
  const title = lang === "en" ? SDG9.title : SDG9.titleKm;
  const topic = lang === "en" ? SDG9.topic : SDG9.topicKm;

  return (
    <div className={["min-h-screen w-full", fontClass].join(" ")}>
      <div className="min-h-screen w-full bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        <div className="mx-auto max-w-6xl p-4 md:p-8">
          <header className="grid grid-cols-[1fr_auto_auto] items-start gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold leading-tight sm:leading-snug line-clamp-2">
                  {t.appTitle}
                </h1>
              </div>

              <p className="mt-1 text-xs sm:text-sm md:text-base text-muted-foreground leading-snug break-words">
                {t.appSubtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setTheme((th) => (th === "dark" ? "light" : "dark"))}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl border bg-background flex items-center justify-center hover:bg-black/5 transition dark:hover:bg-white/10"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              <span className="text-base">{theme === "dark" ? "🌙" : "☀️"}</span>
            </button>

            <button
              type="button"
              onClick={() => setLang((l) => toggleLang(l))}
              className="h-9 w-9 rounded-2xl border bg-background flex items-center justify-center hover:bg-black/5 transition dark:hover:bg-white/10"
              aria-label={TEXT[lang].language}
              title={TEXT[lang].language}
            >
              <FlagIcon lang={lang} />
            </button>
          </header>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
            <Card className="lg:col-span-2 rounded-2xl shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                      <Briefcase className="h-6 w-6" />
                      SDG 9: {title}
                    </CardTitle>

                    <CardDescription className="min-w-0">
                      <span className="text-muted-foreground">
                        {lang === "en" ? "Topic:" : "ប្រធានបទ:"}
                      </span>{" "}
                      <span className="font-medium text-foreground">{topic}</span>
                    </CardDescription>
                  </div>

                  <Button
                    asChild
                    variant="secondary"
                    className="shrink-0 rounded-2xl"
                    title={SDG9.link.label}
                  >
                    <a href={SDG9.link.url} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">{SDG9.link.label}</span>
                    </a>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <Tabs defaultValue="sim" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="about">{t.tabs.about}</TabsTrigger>
                    <TabsTrigger value="process">{t.tabs.process}</TabsTrigger>
                    <TabsTrigger value="sim">{t.tabs.sim}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="about" className="mt-5">
                    <div className="space-y-4">
                      <div className="rounded-3xl border bg-background/70 backdrop-blur p-5 md:p-6 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                            <BookOpen className="h-5 w-5 opacity-80" />
                          </div>

                          <div className="min-w-0 space-y-1">
                            <h3 className="text-lg md:text-xl font-semibold tracking-tight">
                              {t.aboutTitle}
                            </h3>
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                              {t.aboutBody}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-3xl border bg-background p-5 md:p-6 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 opacity-80" />
                            <div className="text-sm font-semibold">
                              {lang === "en"
                                ? "How NIST CSF fits"
                                : "NIST CSF សមស្របយ៉ាងដូចម្តេច"}
                            </div>
                          </div>

                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                            {lang === "en"
                              ? "NIST CSF structures security work into 6 functions: Govern, Identify, Protect, Detect, Respond, Recover. Your checklist maps directly to these steps so users can harden a router with clear actions."
                              : "NIST CSF ជួយរៀបចំការងារសុវត្ថិភាពជា 6 ផ្នែក៖ Govern, Identify, Protect, Detect, Respond, Recover។ Checklist របស់អ្នកភ្ជាប់ទៅផ្នែកទាំងនេះ ដើម្បីឲ្យអ្នកប្រើអាច harden router បានយ៉ាងច្បាស់។"}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {(["GV", "ID", "PR", "DE", "RS", "RC"] as const).map((x) => (
                              <span
                                key={x}
                                className="text-[11px] px-2 py-1 rounded-full bg-black/5 dark:bg-white/10 text-muted-foreground"
                              >
                                {x}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* ✅ Replace "Why this supports SDG 9" card with this */}
<div className="rounded-3xl border bg-background p-5 md:p-6 shadow-sm">
  <div className="flex items-center gap-2">
    <Shield className="h-5 w-5 opacity-80" />
    <div className="text-sm font-semibold">
      {lang === "en" ? "NIST CSF Framework (one-row)" : "NIST CSF Framework (ជាជួរតែមួយ)"}
    </div>
  </div>

  {/* one row: image + content */}
  <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4">
    {/* image */}
    <div className="md:w-[260px] shrink-0 overflow-hidden rounded-2xl border bg-black/5 dark:bg-white/10">
      <img
        src="https://www.nist.gov/sites/default/files/images/2023/08/07/CSF-wheel-revamp-final-white.png"
        alt="NIST Cybersecurity Framework wheel (CSF 2.0 draft)"
        className="w-full h-auto"
        loading="lazy"
      />
    </div>

    {/* text */}
    <div className="min-w-0 flex-1">
      <p className="text-sm text-muted-foreground leading-relaxed">
        {lang === "en"
          ? "Core functions: Govern · Identify · Protect · Detect · Respond · Recover. Your router checklist maps to these functions."
          : "មុខងារសំខាន់ៗ៖ Govern · Identify · Protect · Detect · Respond · Recover។ Checklist Router របស់អ្នកភ្ជាប់ទៅមុខងារទាំងនេះ។"}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl border bg-black/5 dark:bg-white/10 px-3 py-2">
        <div className="text-xs text-muted-foreground truncate">
          {lang === "en" ? "Reference: NIST CSF update (Aug 2023)" : "ឯកសារយោង៖ NIST CSF update (សីហា 2023)"}
        </div>

        <a
          href="https://www.nist.gov/news-events/news/2023/08/nist-drafts-major-update-its-widely-used-cybersecurity-framework"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium inline-flex items-center gap-1 hover:underline shrink-0"
        >
          {lang === "en" ? "Open" : "បើក"}
          <ExternalLink className="h-3.5 w-3.5 opacity-80" />
        </a>
      </div>
    </div>
  </div>
</div>

                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="process" className="mt-4">
                    <div className="space-y-3">
                      <SectionTitle icon={ClipboardList} title={t.processTitle} />
                      <ol className="list-decimal pl-5 text-sm md:text-base text-muted-foreground space-y-1">
                        {t.processSteps.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ol>
                    </div>
                  </TabsContent>

                  <TabsContent value="sim" className="mt-4">
                    <Simulator lang={lang} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <footer className="mt-10 pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={lang}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="text-center text-xs text-muted-foreground"
              >
                {t.tip}
              </motion.div>
            </AnimatePresence>
          </footer>
        </div>
      </div>
    </div>
  );
}
