import { CreditCard, MapPin, Plus, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { listarAreas, type Area } from "@/api/areas";
import { ApiError } from "@/api/apiClient";
import {
  activarTarjeta,
  actualizarTarjeta,
  crearTarjeta,
  desactivarTarjeta,
  eliminarTarjeta,
  type Tarjeta,
  type TarjetaIcono,
} from "@/api/tarjetas";
import { PageHeader } from "@/components/layout/PageHeader";
import { TarjetaColorSelector } from "@/components/tarjetas/TarjetaColorSelector";
import { TarjetaIconSelector } from "@/components/tarjetas/TarjetaIconSelector";
import { TarjetasFilters } from "@/components/tarjetas/TarjetasFilters";
import { TarjetasTable } from "@/components/tarjetas/TarjetasTable";
import { Button } from "@/components/ui/button";
import { CatalogPagination } from "@/components/ui/catalog-pagination";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ServerSearchableSelect } from "@/components/ui/server-searchable-select";
import { useToast } from "@/context/ToastContext";
import { useTarjetas } from "@/hooks/useTarjetas";
import { loadSedeSelectOptions, resolveSedeSelectOption } from "@/lib/porteria-sedes";
import { cn } from "@/lib/utils";

interface Form {
  sedeId: string;
  numero: string;
  color: string;
  icono: TarjetaIcono;
  areaIds: number[];
  activo: boolean;
  enUso: boolean;
}

type ConfirmAction = "activate" | "deactivate" | "delete";

const EMPTY: Form = {
  sedeId: "",
  numero: "",
  color: "#3B82F6",
  icono: "IdCard",
  areaIds: [],
  activo: true,
  enUso: false,
};

export default function TarjetasPage() {
  const list = useTarjetas();
  const toast = useToast();
  const [areas, setAreas] = useState<Area[]>([]);
  const [areasLoading, setAreasLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tarjeta | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarjeta, setConfirmTarjeta] = useState<Tarjeta | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    if (!form.sedeId) {
      setAreas([]);
      setAreasLoading(false);
      return;
    }

    let cancelled = false;
    setAreasLoading(true);
    void listarAreas({
      page: 1,
      limit: 50_000,
      sedeId: Number(form.sedeId),
      activo: true,
      sortBy: "nombre",
      sortOrder: "asc",
    })
      .then((response) => {
        if (!cancelled) setAreas(response.items);
      })
      .catch(() => {
        if (!cancelled) setAreas([]);
      })
      .finally(() => {
        if (!cancelled) setAreasLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [form.sedeId]);

  const message = (reason: unknown) =>
    reason instanceof ApiError ? reason.message : "No se pudo completar la acción.";

  const start = (row?: Tarjeta) => {
    setEditing(row ?? null);
    setForm(
      row
        ? {
            sedeId: String(row.sedeId),
            numero: String(row.numero),
            color: row.color,
            icono: row.icono,
            areaIds: row.areas.map((area) => area.id),
            activo: row.activo,
            enUso: row.enUso,
          }
        : EMPTY,
    );
    setOpen(true);
  };

  const toggleArea = (id: number) => {
    setForm((current) => ({
      ...current,
      areaIds: current.areaIds.includes(id)
        ? current.areaIds.filter((item) => item !== id)
        : [...current.areaIds, id],
    }));
  };

  async function save() {
    if (!form.sedeId) return toast.error("Seleccione una sede.", "Tarjetas");
    const numero = Number(form.numero);
    if (!Number.isInteger(numero) || numero <= 0) {
      return toast.error("El número debe ser un entero positivo.", "Tarjetas");
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(form.color)) {
      return toast.error("Ingrese un color hexadecimal válido.", "Tarjetas");
    }
    if (!form.areaIds.length) return toast.error("Seleccione al menos un área.", "Tarjetas");
    if (form.enUso && !form.activo) {
      return toast.error("Una tarjeta en uso debe permanecer activa.", "Tarjetas");
    }

    setSaving(true);
    try {
      const payload = {
        numero,
        color: form.color,
        icono: form.icono,
        areaIds: form.areaIds,
        activo: form.activo,
        enUso: form.enUso,
      };
      if (editing) await actualizarTarjeta(editing.id, payload);
      else await crearTarjeta({ ...payload, sedeId: Number(form.sedeId) });
      toast.success(editing ? "Tarjeta actualizada." : "Tarjeta creada.", "Tarjetas");
      setOpen(false);
      list.reload();
    } catch (error) {
      toast.error(message(error), "Tarjetas");
    } finally {
      setSaving(false);
    }
  }

  function openConfirm(row: Tarjeta, action: ConfirmAction) {
    if (row.enUso) return;
    setConfirmTarjeta(row);
    setConfirmAction(action);
    setConfirmOpen(true);
  }

  async function confirm() {
    if (!confirmTarjeta || !confirmAction) return;
    setConfirmLoading(true);
    try {
      if (confirmAction === "deactivate") await desactivarTarjeta(confirmTarjeta.id);
      else if (confirmAction === "activate") await activarTarjeta(confirmTarjeta.id);
      else await eliminarTarjeta(confirmTarjeta.id);

      toast.success(confirmAction === "delete" ? "Tarjeta eliminada." : "Estado actualizado.", "Tarjetas");
      setConfirmOpen(false);
      list.reload();
    } catch (error) {
      toast.error(message(error), "Tarjetas");
    } finally {
      setConfirmLoading(false);
    }
  }

  const confirmTitle =
    confirmAction === "deactivate"
      ? "Desactivar tarjeta"
      : confirmAction === "activate"
        ? "Activar tarjeta"
        : "Eliminar tarjeta";
  const confirmDescription =
    confirmAction === "deactivate"
      ? `¿Desactivar la tarjeta ${confirmTarjeta?.numero}?`
      : confirmAction === "activate"
        ? `¿Activar la tarjeta ${confirmTarjeta?.numero}?`
        : `¿Eliminar permanentemente la tarjeta ${confirmTarjeta?.numero}? Esta acción no se puede deshacer.`;
  const destructiveConfirm = confirmAction !== "activate";

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administración"
        title="Tarjetas"
        description="Catálogo independiente de tarjetas y sus áreas habilitadas."
      />
      <TarjetasFilters
        filters={list.filters}
        onChange={list.setFilters}
        onApply={list.applyFilters}
        actions={
          <Button onClick={() => start()}>
            <Plus className="h-4 w-4" />
            Nueva tarjeta
          </Button>
        }
      />
      {list.error ? (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{list.error}</div>
      ) : null}
      {list.loading ? (
        <div className="rounded border p-6 text-sm text-muted-foreground">Cargando tarjetas...</div>
      ) : (
        <TarjetasTable
          rows={list.items}
          sort={list.sort}
          onSort={list.setSortColumn}
          onEdit={start}
          onToggle={(row) => openConfirm(row, row.activo ? "deactivate" : "activate")}
          onDelete={(row) => openConfirm(row, "delete")}
        />
      )}
      <CatalogPagination {...list.pagination} onPage={list.setPage} onLimit={list.setPageLimit} />

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? `Editar tarjeta ${editing.numero}` : "Nueva tarjeta"}
        description="Configure su identificación visual, sede y áreas habilitadas."
        className="max-w-3xl rounded-2xl shadow-xl"
        headerClassName="px-5 py-4 sm:px-6"
        contentClassName="px-5 py-5 sm:px-6"
      >
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <section className="space-y-4 rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
              <h3 className="font-semibold">Ubicación e identificación</h3>
            </div>
            <Field id="tarjeta-sede" label="Sede" required>
              <ServerSearchableSelect
                id="tarjeta-sede"
                value={form.sedeId}
                onChange={(sedeId) => setForm((current) => ({ ...current, sedeId, areaIds: [] }))}
                onLoadOptions={loadSedeSelectOptions}
                resolveSelectedOption={resolveSedeSelectOption}
                defaultSelectedOption={
                  editing
                    ? {
                        value: String(editing.sedeId),
                        label: `${editing.sedeNombre} — ${editing.empresaNombre}`,
                      }
                    : null
                }
                placeholder="Seleccione una sede"
                searchPlaceholder="Buscar sede..."
                disabled={Boolean(editing)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="tarjeta-numero" label="Número" required>
                <Input
                  id="tarjeta-numero"
                  type="number"
                  min="1"
                  value={form.numero}
                  onChange={(event) => setForm((current) => ({ ...current, numero: event.target.value }))}
                  placeholder="Ej.: 101"
                />
              </Field>
              <Field id="tarjeta-color" label="Color" required>
                <TarjetaColorSelector
                  value={form.color}
                  onChange={(color) => setForm((current) => ({ ...current, color }))}
                />
              </Field>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" aria-hidden="true" />
              <h3 className="font-semibold">Apariencia y acceso</h3>
            </div>
            <Field id="tarjeta-icono" label="Ícono" required>
              <TarjetaIconSelector
                value={form.icono}
                onChange={(icono) => setForm((current) => ({ ...current, icono }))}
              />
            </Field>
            <Field id="tarjeta-areas" label="Áreas asignadas" required>
              <div className="rounded-xl border bg-background p-3">
                <div className="mb-3 flex items-center justify-between gap-3 border-b pb-3 text-sm">
                  <span className="text-muted-foreground">Seleccione una o más áreas</span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                    {form.areaIds.length} seleccionada{form.areaIds.length === 1 ? "" : "s"}
                  </span>
                </div>
                {areasLoading ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">Cargando áreas...</p>
                ) : areas.length ? (
                  <div className="grid max-h-48 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                    {areas.map((area) => {
                      const checked = form.areaIds.includes(area.id);
                      return (
                        <label
                          key={area.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                            checked ? "border-primary bg-primary/5" : "hover:border-primary/40 hover:bg-muted/50",
                          )}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-primary"
                            checked={checked}
                            onChange={() => toggleArea(area.id)}
                          />
                          <span className="text-sm font-medium">{area.nombre}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    {form.sedeId
                      ? "No hay áreas activas en esta sede."
                      : "Seleccione una sede para cargar sus áreas."}
                  </p>
                )}
              </div>
            </Field>
          </section>

          <section className="space-y-4 rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              <h3 className="font-semibold">Estado operativo</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="tarjeta-activo" label="Estado">
                <Select
                  id="tarjeta-activo"
                  value={String(form.activo)}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, activo: event.target.value === "true" }))
                  }
                >
                  <option value="true">Activo</option>
                  <option value="false" disabled={form.enUso}>Inactivo</option>
                </Select>
              </Field>
              <Field id="tarjeta-uso" label="Uso">
                <Select
                  id="tarjeta-uso"
                  value={String(form.enUso)}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, enUso: event.target.value === "true" }))
                  }
                >
                  <option value="false">Disponible</option>
                  <option value="true" disabled={!form.activo}>En uso</option>
                </Select>
              </Field>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || areasLoading || !form.sedeId || !form.numero || !form.areaIds.length}
            >
              {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear tarjeta"}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmTitle}
        description={confirmDescription}
        className="max-w-sm rounded-2xl border-transparent bg-white p-5 shadow-[0_20px_25px_-5px_rgba(17,24,39,0.10),0_8px_10px_-6px_rgba(17,24,39,0.08)] dark:border-[#374151] dark:bg-[#1F2937] dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.45),0_8px_10px_-6px_rgba(0,0,0,0.35)]"
        headerClassName="border-b-0 p-0"
        titleClassName="ml-4 text-lg font-bold text-[#111827] dark:text-white"
        descriptionClassName="mb-1.5 ml-4 mt-3 text-[15px] leading-relaxed text-[#4B5563] dark:text-[#E5E7EB]"
        contentClassName="p-0 pt-4"
        closeButtonClassName="text-[#9CA3AF] hover:bg-transparent hover:text-[#4B5563] dark:hover:text-white"
      >
        <div className="flex justify-end gap-2.5">
          <Button
            type="button"
            onClick={() => setConfirmOpen(false)}
            disabled={confirmLoading}
            className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] font-semibold text-[#111827] hover:bg-[#F3F4F6] dark:border-transparent dark:bg-[#374151] dark:text-[#E5E7EB] dark:hover:bg-[#4B5563]"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void confirm()}
            disabled={confirmLoading}
            className={cn(
              "rounded-xl font-semibold text-white",
              destructiveConfirm
                ? "bg-[#EF4444] hover:bg-[#DC2626] dark:hover:bg-[#F87171]"
                : "bg-emerald-600 hover:bg-emerald-700",
            )}
          >
            {confirmLoading ? "Procesando..." : "Confirmar"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
