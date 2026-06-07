/**
 * @system     FlowAluminio
 * @module     app/superadmin/parametros/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Parámetros del sistema — empresa, plantas, categorías de gasto, tipos de chatarra
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getEmpresa,
  getPlantas,
  getCategoriasGasto,
  getTiposChatarra,
  actualizarEmpresa,
  crearPlanta,
  togglePlanta,
  crearCategoriaGasto,
  toggleCategoriaGasto,
  crearTipoChatarra,
  toggleTipoChatarra,
} from '@/app/(superadmin)/parametros/actions'
import { ParametroInlineEditor } from '@/components/superadmin/parametro-inline-editor'
import { ParametroLista } from '@/components/superadmin/parametro-lista'

export default async function ParametrosPage() {
  const [empresa, plantas, categorias, tiposChatarra] = await Promise.all([
    getEmpresa(),
    getPlantas(),
    getCategoriasGasto(),
    getTiposChatarra(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <h1 className="font-semibold text-lg">Parámetros</h1>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">

        {/* Empresa */}
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm text-muted-foreground">Empresa</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ParametroInlineEditor
              label="Nombre"
              valor={empresa?.nombre ?? ''}
              onGuardar={actualizarEmpresa}
            />
          </CardContent>
        </Card>

        {/* Plantas */}
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm text-muted-foreground">Plantas</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ParametroLista
              items={plantas.map((p) => ({ id: p.id, nombre: p.nombre, activo: p.activo ?? true }))}
              onCrear={crearPlanta}
              onToggle={togglePlanta}
              placeholder="Nueva planta..."
            />
          </CardContent>
        </Card>

        {/* Categorías de gasto */}
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm text-muted-foreground">Categorías de gasto</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ParametroLista
              items={categorias.map((c) => ({ id: c.id, nombre: c.nombre, activo: c.activo ?? true }))}
              onCrear={crearCategoriaGasto}
              onToggle={toggleCategoriaGasto}
              placeholder="Nueva categoría..."
            />
          </CardContent>
        </Card>

        {/* Tipos de chatarra */}
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm text-muted-foreground">Tipos de chatarra</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ParametroLista
              items={tiposChatarra.map((t) => ({ id: t.id, nombre: t.nombre, activo: t.activo ?? true }))}
              onCrear={crearTipoChatarra}
              onToggle={toggleTipoChatarra}
              placeholder="Nuevo tipo..."
            />
          </CardContent>
        </Card>

      </main>
    </div>
  )
}
