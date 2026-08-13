"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { submitReview } from "@/app/actions/review";

export default function StarRatingForm({ appointmentId, barberName }: { appointmentId: string, barberName: string }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Por favor, selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append("rating", rating.toString());
    formData.append("appointmentId", appointmentId);
    
    const res = await submitReview(formData);
    
    setIsSubmitting(false);
    if (res.success) {
      setIsSuccess(true);
    } else {
      alert(res.error);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-4">
          <Star size={32} className="fill-success" />
        </div>
        <h2 className="text-2xl font-bold text-success">Avaliação Enviada!</h2>
        <p className="text-text-secondary">Muito obrigado pelo seu feedback. Isso nos ajuda a manter sempre a melhor qualidade.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            className="p-2 transition-transform hover:scale-110 focus:outline-none"
          >
            <Star 
              size={40} 
              className={`transition-colors ${(hoverRating || rating) >= star ? 'text-primary fill-primary' : 'text-secondary'}`} 
            />
          </button>
        ))}
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-bold text-text-secondary block">Deixe um comentário (Opcional)</label>
        <textarea 
          name="comment"
          rows={3}
          placeholder={`O que achou do atendimento de ${barberName}?`}
          className="w-full bg-background border border-secondary rounded-xl p-4 text-text-primary focus:border-primary focus:outline-none resize-none transition-colors"
        ></textarea>
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting || rating === 0}
        className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-primary/20"
      >
        {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
      </button>
    </form>
  );
}
