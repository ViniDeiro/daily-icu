export type Specialty =
  | "intensivista"
  | "enfermeiro"
  | "fisioterapeuta"
  | "farmaceutico"
  | "nutricionista";

export const SPECIALTY_LABELS: Record<Specialty, string> = {
  intensivista: "Médico Intensivista",
  enfermeiro: "Enfermeiro(a)",
  fisioterapeuta: "Fisioterapeuta",
  farmaceutico: "Farmacêutico(a)",
  nutricionista: "Nutricionista",
};

export const SPECIALTY_ICONS: Record<Specialty, string> = {
  intensivista: "🩺",
  enfermeiro: "💉",
  fisioterapeuta: "🫁",
  farmaceutico: "💊",
  nutricionista: "🍎",
};

export type SedoanalgesiaRow = {
  droga?: string;
  vazao?: string;
  inicio?: string;
  fim?: string;
};

export type DvaRow = {
  droga?: string;
  vazao?: string;
  inicio?: string;
  fim?: string;
};

export type AtbRow = {
  atb?: string;
  inicio?: string;
  fim?: string;
};

export type DispositivoRow = {
  tipo?: string;
  sitio?: string;
  rimaNum?: string;
  insercao?: string;
  retirada?: string;
};

export type ExameImagemRow = {
  data?: string;
  tipo?: string;
  resultado?: string;
};

export type CulturaRow = {
  data?: string;
  tipo?: string;
  resultado?: string;
};

export type HandoffData = {
  // Header
  fa?: string;
  paciente?: string;
  idade?: string;
  alergias?: string;
  hd?: string;
  leito?: string;
  dih?: string;
  dUti?: string;
  prevAlta?: string;
  quantosDias?: string;
  data?: string;

  // History
  hda?: string;
  hpp?: string;
  muc?: string;

  // Subjective / General Impression
  subjetivo?: string;
  exameFisico?: string;
  impressaoGeral?: string;
  evolucao?: string;
  evolucaoPorque?: string;

  // Nursing Controls
  pamMin?: string;
  pamMax?: string;
  fc?: string;
  fr?: string;
  temp?: string;
  sat?: string;
  dextro1?: string;
  dextro2?: string;

  // Hemodialysis
  hemodialiseData?: string;
  hemodialiseTempo?: string;
  hemodialisePerdas?: string;

  // Fluid Balance
  diureseValor?: string;
  hmd?: string;
  bh?: string;
  ultimaEvacuacao?: string;

  // Drains
  drenos?: string;

  // Labs
  hemoglobina?: string;
  hemoglobinaHoje?: string;
  hematocrito?: string;
  hematocritoHoje?: string;
  leucocitos?: string;
  leucocitosHoje?: string;
  plaquetas?: string;
  plaquetasHoje?: string;
  pcr?: string;
  pcrHoje?: string;
  ureia?: string;
  ureiaHoje?: string;
  creatinina?: string;
  creatininaHoje?: string;
  sodio?: string;
  sodioHoje?: string;
  potassio?: string;
  potassioHoje?: string;
  calcio?: string;
  calcioHoje?: string;
  magnesio?: string;
  magnesioHoje?: string;
  albumina?: string;
  albuminaHoje?: string;
  troponina?: string;
  troponinaHoje?: string;
  cpk?: string;
  cpkHoje?: string;
  ckmb?: string;
  ckmbHoje?: string;
  lactato?: string;
  lactatoHoje?: string;
  outrosLabs?: string;
  outrosLabsHoje?: string;

  // Gasometry
  gasHorario?: string;
  gasPh?: string;
  gasPaco2?: string;
  gasPao2?: string;
  gasHco3?: string;
  gasBe?: string;
  gasSatO2?: string;
  gasIo?: string;
  gasGapCo2?: string;

  // Cultures / Serology
  culturas?: CulturaRow[];

  // Imaging
  examesImagem?: ExameImagemRow[];

  // Devices
  dispositivos?: DispositivoRow[];

  // 1) NEURO
  sedoanalgesia?: SedoanalgesiaRow[];
  glasgow?: string;
  rass?: string;
  pupilas?: string;
  despertarDiarioRass?: string;
  rodizioSedacao?: string;
  avaliacaoDor?: string;

  // 2) RESPIRATORY
  ventilacao?: string;
  modo?: string;
  rima?: string;
  frResp?: string;
  fio2?: string;
  peep?: string;
  pcVcPs?: string;
  fluxo?: string;
  relacaoIE?: string;
  tosse?: string;
  ppico?: string;
  pplato?: string;
  irrsTobin?: string;
  dp?: string;
  protocoloDesmame?: string;
  dataProna?: string;
  pcuffManha?: string;
  pcuffTarde?: string;
  pcuffNoite?: string;
  obsRespManha?: string;
  obsRespTarde?: string;
  obsRespNoite?: string;

  // 3) CARDIOVASCULAR
  dvas?: DvaRow[];
  pamMmhg?: string;
  fcCardio?: string;
  tec?: string;
  estavelHmd?: string;
  reduzirDvas?: string;
  alteracoesEcg?: string;

  // 4) ABDOMINAL / NUTRI
  dieta?: string;
  dietaVia?: string;
  dietaVazaoAtual?: string;
  dietaVazaoMeta?: string;
  atingiuMeta2000?: string;
  glicemiaAlvo?: string;
  evacuacaoNormal?: string;
  profilaxiaUlcera?: string;
  obsNutri?: string;
  agua?: string;
  peso?: string;
  altura?: string;

  // 5) RENAL
  balancoHidricoNeutro?: string;
  reposicaoEletrolitica?: string;
  diureseMlKgH?: string;
  planoDialitico?: string;
  inicioDialise?: string;
  obsRenal?: string;

  // 6) INFECCIOSO / HEMATO
  febre?: string;
  atbs?: AtbRow[];
  desescalonarAtb?: string;
  culturasChecadas?: string;
  desinvadirDispositivos?: string;
  profilaxiaTvp?: string;
  profilaxiaTvpMotivo?: string;

  // 7) OTHERS
  lppLocal?: string;
  lppEstagio?: string;
  peleAdmissao?: string;
  peleEvolucao?: string;
  cabeceira30?: string;
  oftalmoproteção?: string;
  mudancaDecubito?: string;
  curativo?: string;
  ims?: string;

  // Scales
  braden?: string;
  morse?: string;
  fugulin?: string;
  pps?: string;
  saps3?: string;
  txMort?: string;

  // Notable
  dignoNota?: string;

  // Today labs
  labsHoje?: string;

  // Day plan
  planoDia?: string;
};

export type HandoffEntry = {
  id: string;
  patientId: string;
  date: string;
  specialty: Specialty;
  filledBy: string;
  filledAt: string;
  data: Partial<HandoffData>;
};

export type HandoffSection =
  | "header"
  | "history"
  | "subjective"
  | "nursingControls"
  | "hemodialysis"
  | "fluidBalance"
  | "labs"
  | "gasometry"
  | "cultures"
  | "imaging"
  | "devices"
  | "neuro"
  | "respiratory"
  | "cardiovascular"
  | "abdominalNutri"
  | "renal"
  | "infectious"
  | "others"
  | "scales"
  | "planoDia";

export const SPECIALTY_SECTIONS: Record<Specialty, HandoffSection[]> = {
  intensivista: [
    "header",
    "history",
    "subjective",
    "labs",
    "gasometry",
    "neuro",
    "cardiovascular",
    "respiratory",
    "abdominalNutri",
    "renal",
    "infectious",
    "others",
    "scales",
    "planoDia",
  ],
  enfermeiro: [
    "header",
    "nursingControls",
    "hemodialysis",
    "fluidBalance",
    "devices",
    "others",
    "scales",
  ],
  fisioterapeuta: [
    "header",
    "respiratory",
    "gasometry",
    "others",
  ],
  farmaceutico: [
    "header",
    "neuro",
    "cardiovascular",
    "infectious",
  ],
  nutricionista: [
    "header",
    "abdominalNutri",
  ],
};

export const SECTION_LABELS: Record<HandoffSection, string> = {
  header: "Identificação do Paciente",
  history: "Histórico (HDA / HPP / MUC)",
  subjective: "Subjetivo / Impressão Geral",
  nursingControls: "Controles de Enfermagem",
  hemodialysis: "Hemodiálise",
  fluidBalance: "Balanço Hídrico",
  labs: "Laboratoriais",
  gasometry: "Gasometria",
  cultures: "Culturas / Sorologias",
  imaging: "Exames de Imagem",
  devices: "Dispositivos",
  neuro: "1) Neurológico",
  respiratory: "2) Respiratório",
  cardiovascular: "3) Cardiovascular",
  abdominalNutri: "4) Abdominal / Nutri",
  renal: "5) Renal / Genitourinário",
  infectious: "6) Infeccioso / Hemato",
  others: "7) Outros (Pele, Mobilidade)",
  scales: "Escalas",
  planoDia: "Plano do Dia",
};
