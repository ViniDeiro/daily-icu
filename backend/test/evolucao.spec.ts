import { describe, it, expect } from "vitest";
import { duplicateFromLast } from "../src/services/evolucao";

describe("duplicateFromLast", () => {
  it("copies fields when last exists", () => {
    const last: any = {
      saps3: 50,
      diagnosticoPrincipal: "DX",
      diagnosticosSecundarios: "DX2",
      comorbidades: "DM",
      drogasVasoativas: true,
      drogasVasoativasDescricao: "Nora",
      ventilacaoMecanica: true,
      viaAerea: "IOT",
      dispositivos: ["CVC", "SVD"]
    };
    const r = duplicateFromLast(last);
    expect(r.saps3).toBe(50);
    expect(r.diagnosticoPrincipal).toBe("DX");
    expect(r.drogasVasoativas).toBe(true);
    expect(r.viaAerea).toBe("IOT");
    expect(r.dispositivos).toEqual(["CVC", "SVD"]);
  });
  it("defaults when last is null", () => {
    const r = duplicateFromLast(null);
    expect(r.saps3).toBeNull();
    expect(r.drogasVasoativas).toBe(false);
    expect(r.viaAerea).toBe("NENHUMA");
    expect(r.dispositivos).toEqual([]);
  });
});

