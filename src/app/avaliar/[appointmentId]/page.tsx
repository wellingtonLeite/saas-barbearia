import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Scissors } from "lucide-react";
import StarRatingForm from "@/components/StarRatingForm";

export default async function AvaliarPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const resolvedParams = await params;
  
  const appointment = await db.appointment.findUnique({
    where: { id: resolvedParams.appointmentId },
    include: {
      tenant: true,
      barber: true,
      service: true,
      review: true
    }
  });

  if (!appointment) notFound();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-surface border border-secondary rounded-2xl overflow-hidden shadow-2xl animate-fade-in p-8">
        
        <div className="text-center mb-8">
          {appointment.tenant.logo_url ? (
            <img src={appointment.tenant.logo_url} alt="Logo" className="w-20 h-20 object-cover rounded-xl mx-auto mb-4" />
          ) : (
            <div className="w-20 h-20 bg-primary/20 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Scissors size={32} />
            </div>
          )}
          <h1 className="text-2xl font-display font-bold text-text-primary">Avalie seu atendimento</h1>
          <p className="text-text-secondary mt-2">
            Como foi o <strong>{appointment.service.name}</strong> com <strong>{appointment.barber.name}</strong>?
          </p>
        </div>

        {appointment.status !== 'COMPLETED' ? (
          <div className="bg-warning/10 border border-warning/30 p-6 rounded-xl text-center">
            <p className="text-warning font-bold">Este atendimento ainda não foi finalizado.</p>
            <p className="text-sm text-warning/80 mt-2">Você só poderá avaliar após a conclusão do serviço.</p>
          </div>
        ) : appointment.review ? (
          <div className="bg-success/10 border border-success/30 p-6 rounded-xl text-center">
            <p className="text-success font-bold text-lg mb-2">Você já avaliou este atendimento!</p>
            <div className="flex justify-center gap-1 mb-4 text-primary">
              {[...Array(appointment.review.rating)].map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ))}
            </div>
            {appointment.review.comment && (
              <p className="text-sm text-text-secondary italic">"{appointment.review.comment}"</p>
            )}
          </div>
        ) : (
          <StarRatingForm appointmentId={appointment.id} barberName={appointment.barber.name} />
        )}
      </div>
    </div>
  );
}
