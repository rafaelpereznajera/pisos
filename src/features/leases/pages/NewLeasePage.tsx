import { Link } from 'react-router-dom'

export function NewLeasePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nuevo contrato</h1>
          <p className="mt-1 text-sm text-slate-600">Pantalla inicial para dar de alta contratos.</p>
        </div>

        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
          En el siguiente paso añadiremos el formulario completo de contrato.
        </p>

        <div className="mt-6">
          <Link
            to="/tenants"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Volver a inquilinos
          </Link>
        </div>
      </section>
    </main>
  )
}
