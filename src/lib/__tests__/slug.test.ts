import { describe, it, expect } from "vitest";
import { slugify, formatArchiveNumber, archiveSlug } from "@/lib/slug";

describe("slugify", () => {
  it("normaliza acentos y espacios", () => {
    expect(slugify("Daniela Requeña Ñoño")).toBe("daniela-requena-nono");
  });
  it("colapsa símbolos y recorta guiones", () => {
    expect(slugify("  ¡Hola, Mundo!  ")).toBe("hola-mundo");
  });
  it("vacío para cadena sin alfanuméricos", () => {
    expect(slugify("¡!¿?")).toBe("");
  });
});

describe("formatArchiveNumber", () => {
  it("rellena a 3 dígitos", () => {
    expect(formatArchiveNumber(7)).toBe("007");
    expect(formatArchiveNumber(42)).toBe("042");
    expect(formatArchiveNumber(128)).toBe("128");
  });
});

describe("archiveSlug", () => {
  it("combina número y nombre", () => {
    expect(archiveSlug(24, "María Elena Ruiz")).toBe("024-maria-elena-ruiz");
  });
  it("solo número si el nombre queda vacío", () => {
    expect(archiveSlug(3, "···")).toBe("003");
  });
});
