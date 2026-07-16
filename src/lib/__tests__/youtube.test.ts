import { describe, it, expect } from "vitest";
import { parseYoutubeId, parseIsoDuration, parseChaptersFromDescription } from "@/lib/youtube";

describe("parseYoutubeId", () => {
  it("watch URL", () => {
    expect(parseYoutubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("youtu.be", () => {
    expect(parseYoutubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("shorts", () => {
    expect(parseYoutubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("id crudo", () => {
    expect(parseYoutubeId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("basura", () => {
    expect(parseYoutubeId("hola mundo")).toBeNull();
  });
});

describe("parseIsoDuration", () => {
  it("minutos y segundos", () => {
    expect(parseIsoDuration("PT12M34S")).toBe(754);
  });
  it("horas", () => {
    expect(parseIsoDuration("PT1H2M3S")).toBe(3723);
  });
  it("solo segundos", () => {
    expect(parseIsoDuration("PT45S")).toBe(45);
  });
});

describe("parseChaptersFromDescription", () => {
  it("extrae capítulos que empiezan en 0", () => {
    const desc = "0:00 Introducción\n2:15 Formación\n10:40 Cierre";
    const ch = parseChaptersFromDescription(desc);
    expect(ch.length).toBe(3);
    expect(ch[0]).toEqual({ t: 0, label: "Introducción" });
    expect(ch[1]).toEqual({ t: 135, label: "Formación" });
  });
  it("ignora si no empieza cerca de 0", () => {
    expect(parseChaptersFromDescription("5:00 algo\n9:00 otro")).toEqual([]);
  });
});
