import { beforeEach, describe, expect, it } from "@jest/globals";
import { usePropertyCreatorStore } from "../../../../stores/creator/propertyCreatorStore";

describe("propertyCreatorStore", () => {
  beforeEach(() => {
    localStorage.clear();
    usePropertyCreatorStore.setState({ form: {} });
  });

  it("setField actualiza un campo y persiste", () => {
    const store = usePropertyCreatorStore.getState();
    store.setField("title", "Casa en la playa");
    expect(usePropertyCreatorStore.getState().form.title).toBe("Casa en la playa");
    const persisted = localStorage.getItem("creator:property");
    expect(persisted).toBeTruthy();
    const parsed = JSON.parse(persisted as string);
    expect(parsed.state.form.title).toBe("Casa en la playa");
    expect(parsed.version).toBe(1);
  });

  it("resetForm limpia el estado", () => {
    const store = usePropertyCreatorStore.getState();
    store.setField("title", "Casa");
    store.resetForm();
    expect(usePropertyCreatorStore.getState().form).toEqual({});
    const persisted = localStorage.getItem("creator:property");
    const parsed = JSON.parse(persisted as string);
    expect(parsed.state.form).toEqual({});
  });

  it("updateFields hace merge de múltiples campos", () => {
    const store = usePropertyCreatorStore.getState();
    store.updateFields({ price: 250000, surface: 120 });
    expect(usePropertyCreatorStore.getState().form.price).toBe(250000);
    expect(usePropertyCreatorStore.getState().form.surface).toBe(120);
  });

  it("setForm reemplaza el formulario completo", () => {
    const store = usePropertyCreatorStore.getState();
    store.setForm({ title: "Casa", price: 100000 });
    expect(usePropertyCreatorStore.getState().form).toEqual({ title: "Casa", price: 100000 });
    store.setForm({ description: "Bonita casa" });
    expect(usePropertyCreatorStore.getState().form).toEqual({ description: "Bonita casa" });
  });

  it("addImage agrega una imagen", () => {
    const store = usePropertyCreatorStore.getState();
    store.addImage({ url: "https://example.com/a.jpg" });
    expect(usePropertyCreatorStore.getState().form.images).toEqual([{ url: "https://example.com/a.jpg" }]);
  });

  it("removeImageByUrl elimina la imagen correcta", () => {
    const store = usePropertyCreatorStore.getState();
    store.addImage({ url: "https://example.com/a.jpg" });
    store.addImage({ url: "https://example.com/b.jpg" });
    store.removeImageByUrl("https://example.com/a.jpg");
    expect(usePropertyCreatorStore.getState().form.images).toEqual([{ url: "https://example.com/b.jpg" }]);
  });

  it("clearImages limpia todas las imágenes", () => {
    const store = usePropertyCreatorStore.getState();
    store.addImage({ url: "https://example.com/a.jpg" });
    store.addImage({ url: "https://example.com/b.jpg" });
    store.clearImages();
    expect(usePropertyCreatorStore.getState().form.images).toEqual([]);
  });

  it("persistencia guarda solo el formulario", () => {
    const store = usePropertyCreatorStore.getState();
    store.setField("title", "Persistente");
    store.updateFields({ status: "draft" });
    const persisted = localStorage.getItem("creator:property");
    const parsed = JSON.parse(persisted as string);
    expect(Object.keys(parsed.state)).toEqual(["form"]);
    expect(parsed.state.form.title).toBe("Persistente");
    expect(parsed.state.form.status).toBe("draft");
  });

  it("actualizaciones parciales conservan valores existentes", () => {
    const store = usePropertyCreatorStore.getState();
    store.setForm({ title: "Inicial", price: 1 });
    store.updateFields({ surface: 50 });
    expect(usePropertyCreatorStore.getState().form).toEqual({ title: "Inicial", price: 1, surface: 50 });
  });
});