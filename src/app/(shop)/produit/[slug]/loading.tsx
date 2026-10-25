export default function ProductLoading() {
  return (
    <div className="min-h-[75vh] w-full flex items-center justify-center pointer-events-none" aria-hidden="true">
      {/* Spinner style Facebook : simple anneau jaune pur tournant dans le vide sans boîte ni modal */}
      <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full border-[3.5px] border-amber-400/25 border-t-amber-500 animate-spin" />
    </div>
  )
}
