export const CID10_MOCK = [
  { code: "A41.9", description: "Sepse não especificada" },
  { code: "J18.9", description: "Pneumonia não especificada" },
  { code: "J96.0", description: "Insuficiência respiratória aguda" },
  { code: "I50.9", description: "Insuficiência cardíaca não especificada" },
  { code: "N17.9", description: "Insuficiência renal aguda não especificada" },
  { code: "I64", description: "Acidente vascular cerebral, não especificado como hemorrágico ou isquêmico" },
  { code: "R57.0", description: "Choque cardiogênico" },
  { code: "R57.1", description: "Choque hipovolêmico" },
  { code: "R57.8", description: "Outro choque" },
  { code: "A41.0", description: "Sepse devida a Staphylococcus aureus" },
  { code: "U07.1", description: "COVID-19" }
];

export function searchCID(query: string) {
  const q = query.toLowerCase();
  return CID10_MOCK.filter(
    (c) => c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
  );
}
