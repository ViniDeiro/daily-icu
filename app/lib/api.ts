import axios from "axios";
import Constants from "expo-constants";
import { useAuth } from "../stores/auth";

const envBaseURL = (globalThis as any)?.process?.env?.EXPO_PUBLIC_API_BASE_URL as string | undefined;
const envMockMode = (globalThis as any)?.process?.env?.EXPO_PUBLIC_MOCK_MODE as string | undefined;
const extraMockMode =
  (Constants?.expoConfig?.extra as any)?.mockMode ??
  ((Constants as any)?.manifest?.extra as any)?.mockMode;
const mockMode = envMockMode === "1" || envMockMode === "true" || !!extraMockMode;

const baseURL =
  envBaseURL ||
  (Constants?.expoConfig?.extra as any)?.apiBaseUrl ||
  ((Constants as any)?.manifest?.extra as any)?.apiBaseUrl ||
  "http://localhost:3000";

export const api = axios.create({ baseURL });

if (mockMode) {
  type Hospital = { id: string; nome: string };
  type Paciente = {
    id: string;
    nome: string;
    registroHospitalar: string;
    dataInternacaoUti: string | null;
    dataInternacaoHospitalar?: string | null;
    dataNascimento?: string | null;
    leito?: string | null;
    previsaoAlta?: string | null;
    alergias?: string | null;
    setor?: string | null;
    saps3Atual?: number | null;
    mortalidadeEstimada?: number | null;
    baseClinica?: any;
  };
  type Day = {
    id: string;
    data: string;
    diaInternacaoUti: number;
    condutaDiaria: string | null;
    saps3?: number | null;
    diagnosticoPrincipal?: string | null;
    diagnosticosSecundarios?: string | null;
    comorbidades?: string | null;
    hda?: string | null;
    hpp?: string | null;
    muc?: string | null;
    neurologico?: string | null;
    respiratorio?: string | null;
    cardiovascular?: string | null;
    renal?: string | null;
    gastrointestinal?: string | null;
    infectologico?: string | null;
    exames?: string | null;
    drogasVasoativas?: boolean;
    drogasVasoativasDescricao?: string | null;
    ventilacaoMecanica?: boolean;
    viaAerea?: "IOT" | "TQT" | "NENHUMA";
    dispositivos?: string[];
  };

  const hospitals: Hospital[] = [
    { id: "h1", nome: "Hospital Central" },
    { id: "h2", nome: "Hospital Norte" }
  ];

  const patients: Paciente[] = [
    {
      id: "p1",
      nome: "Paciente Teste 01",
      registroHospitalar: "64111",
      dataInternacaoUti: new Date(Date.now() - 3 * 86_400_000).toISOString(),
      dataInternacaoHospitalar: new Date(Date.now() - 5 * 86_400_000).toISOString(),
      dataNascimento: "1969-02-12",
      leito: "12",
      setor: "UTI 1",
      previsaoAlta: new Date(Date.now() + 2 * 86_400_000).toISOString(),
      alergias: "Dipirona",
      saps3Atual: 62,
      mortalidadeEstimada: 18.4,
      baseClinica: {
        diagnosticoPrincipal: "Choque séptico foco pulmonar",
        comorbidades: "HAS; DM2",
        hda: "Quadro de dispneia e febre há 3 dias.",
        hpp: "HAS, DM2.",
        muc: "Sem outras particularidades.",
        saps3: 62,
        ventilacaoMecanica: true,
        viaAerea: "IOT",
        dispositivos: ["CVC", "SVD"]
      }
    },
    {
      id: "p2",
      nome: "Paciente Teste 02",
      registroHospitalar: "72810",
      dataInternacaoUti: new Date(Date.now() - 1 * 86_400_000).toISOString(),
      dataInternacaoHospitalar: new Date(Date.now() - 2 * 86_400_000).toISOString(),
      dataNascimento: "1982-11-03",
      leito: "03",
      setor: "UTI 2",
      saps3Atual: 44,
      mortalidadeEstimada: 7.2
    }
  ];

  const daysByPatientId: Record<string, Day[]> = {};
  function ensureDays(pid: string) {
    if (daysByPatientId[pid]) return;
    const today = new Date();
    const dayId = `d-${pid}-1`;
    daysByPatientId[pid] = [
      {
        id: dayId,
        data: today.toISOString(),
        diaInternacaoUti: 1,
        condutaDiaria: "Manter suporte, revisar antibiótico, reavaliar VM.",
        saps3: patients.find((p) => p.id === pid)?.saps3Atual ?? null,
        diagnosticoPrincipal: patients.find((p) => p.id === pid)?.baseClinica?.diagnosticoPrincipal ?? null,
        diagnosticosSecundarios: null,
        comorbidades: patients.find((p) => p.id === pid)?.baseClinica?.comorbidades ?? null,
        hda: patients.find((p) => p.id === pid)?.baseClinica?.hda ?? null,
        hpp: patients.find((p) => p.id === pid)?.baseClinica?.hpp ?? null,
        muc: patients.find((p) => p.id === pid)?.baseClinica?.muc ?? null,
        neurologico: "Sedação leve, sem déficits focais.",
        respiratorio: "VM protetora, FiO2 40%.",
        cardiovascular: "MAP > 65, reduzindo DVA.",
        renal: "Diurese preservada.",
        gastrointestinal: "Dieta enteral iniciada.",
        infectologico: "Hemoculturas colhidas.",
        exames: "Gasometria com melhora discreta.",
        drogasVasoativas: true,
        drogasVasoativasDescricao: "Noradrenalina baixa dose",
        ventilacaoMecanica: true,
        viaAerea: "IOT",
        dispositivos: ["CVC", "SVD"]
      }
    ];
  }

  function normPath(url?: string) {
    if (!url) return "/";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      try {
        return new URL(url).pathname;
      } catch {
        return url;
      }
    }
    return url.startsWith("/") ? url : `/${url}`;
  }

  function json(status: number, data: any, config: any) {
    return Promise.resolve({
      status,
      statusText: String(status),
      headers: { "content-type": "application/json" },
      config,
      data
    } as any);
  }

  api.defaults.adapter = async (config) => {
    const method = String(config.method || "get").toLowerCase();
    const path = normPath(config.url);

    if (method === "post" && path === "/auth/login") {
      return json(200, { token: "mock-token" }, config);
    }

    if (method === "get" && path === "/hospitals") {
      return json(200, hospitals, config);
    }

    // ADD: mock create patient
    if (method === "post" && path === "/patients") {
      const body = config.data ? (typeof config.data === "string" ? JSON.parse(config.data) : config.data) : {};
      const id = `p-${Math.random().toString(36).slice(2, 9)}`;
      const p: Paciente = {
        id,
        nome: body?.nome ?? "Paciente",
        registroHospitalar: body?.registroHospitalar ?? String(Math.floor(Math.random() * 100000)),
        leito: body?.leito ?? null,
        dataNascimento: body?.dataNascimento ?? null,
        dataInternacaoHospitalar: body?.dataInternacaoHospitalar ?? null,
        dataInternacaoUti: body?.dataInternacaoUti ?? null,
        previsaoAlta: body?.previsaoAlta ?? null,
        alergias: body?.alergias ?? null,
        setor: "UTI",
        saps3Atual: null,
        mortalidadeEstimada: null,
        baseClinica: null
      };
      patients.unshift(p);
      return json(201, p, config);
    }

    if (method === "get" && path === "/patients") {
      return json(
        200,
        patients.map((p) => ({
          id: p.id,
          nome: p.nome,
          registroHospitalar: p.registroHospitalar,
          dataInternacaoUti: p.dataInternacaoUti,
          dataInternacaoHospitalar: p.dataInternacaoHospitalar ?? null,
          dataNascimento: p.dataNascimento ?? null,
          saps3Atual: p.saps3Atual ?? null,
          mortalidadeEstimada: p.mortalidadeEstimada ?? null
        })),
        config
      );
    }

    const patientMatch = path.match(/^\/patients\/([^/]+)$/);
    if (method === "get" && patientMatch) {
      const pid = patientMatch[1];
      const p = patients.find((x) => x.id === pid);
      if (!p) return json(404, { message: "Not found" }, config);
      return json(
        200,
        {
          id: p.id,
          nome: p.nome,
          registroHospitalar: p.registroHospitalar,
          leito: p.leito ?? null,
          dataNascimento: p.dataNascimento ?? null,
          dataInternacaoHospitalar: p.dataInternacaoHospitalar ?? null,
          dataInternacaoUti: p.dataInternacaoUti ?? null,
          previsaoAlta: p.previsaoAlta ?? null,
          alergias: p.alergias ?? null,
          setor: p.setor ?? null,
          baseClinica: p.baseClinica ?? null
        },
        config
      );
    }

    const daysMatch = path.match(/^\/patients\/([^/]+)\/days$/);
    if (daysMatch) {
      const pid = daysMatch[1];
      ensureDays(pid);
      if (method === "get") {
        const days = daysByPatientId[pid] ?? [];
        const sorted = [...days].sort((a, b) => (a.data > b.data ? -1 : 1));
        return json(200, sorted, config);
      }
      if (method === "post") {
        const body = config.data ? (typeof config.data === "string" ? JSON.parse(config.data) : config.data) : {};
        const dataIso = body?.data ? String(body.data) : new Date().toISOString();
        const list = daysByPatientId[pid] ?? [];
        const next: Day = {
          id: `d-${pid}-${list.length + 1}`,
          data: dataIso,
          diaInternacaoUti: list.length + 1,
          condutaDiaria: body?.condutaDiaria ?? ""
        };
        daysByPatientId[pid] = [next, ...list];
        return json(201, next, config);
      }
    }

    const copyMatch = path.match(/^\/patients\/([^/]+)\/days\/([^/]+)\/copy-conduta$/);
    if (method === "post" && copyMatch) {
      const pid = copyMatch[1];
      ensureDays(pid);
      const list = daysByPatientId[pid] ?? [];
      const idx = list.findIndex((d) => d.id === copyMatch[2]);
      const prev = idx >= 0 ? list[idx + 1] : null;
      return json(200, { conduta: prev?.condutaDiaria ?? "" }, config);
    }

    const putMatch = path.match(/^\/patients\/([^/]+)\/days\/([^/]+)$/);
    if (method === "put" && putMatch) {
      const pid = putMatch[1];
      const dayId = putMatch[2];
      ensureDays(pid);
      const list = daysByPatientId[pid] ?? [];
      const i = list.findIndex((d) => d.id === dayId);
      if (i < 0) return json(404, { message: "Not found" }, config);
      const body = config.data ? (typeof config.data === "string" ? JSON.parse(config.data) : config.data) : {};
      const updated: Day = {
        ...list[i],
        ...body,
        dispositivos: Array.isArray(body?.dispositivos) ? body.dispositivos : list[i].dispositivos
      };
      list[i] = updated;
      daysByPatientId[pid] = list;
      return json(200, updated, config);
    }

    return json(404, { message: "Not found", path }, config);
  };
}

api.interceptors.request.use((config) => {
  const token = useAuth.getState().token;
  const hospitalId = useAuth.getState().hospitalId;
  if (token) {
    const h = (config.headers || {}) as any;
    h.Authorization = `Bearer ${token}`;
    if (hospitalId) h["X-Hospital-Id"] = hospitalId;
    config.headers = h;
  }
  return config;
});
