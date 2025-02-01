import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface SubmissionConfirmationProps {
  salonId?: string;
}

export default function SubmissionConfirmation({ salonId }: SubmissionConfirmationProps) {
  const router = useRouter();

  return (
    <Card className="w-full max-w-2xl mx-auto p-8">
      <div className="flex flex-col items-center justify-center space-y-6">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <h2 className="text-2xl font-bold">Demande envoyée avec succès !</h2>
        <p className="text-gray-600 max-w-md text-center">
          Votre demande d&apos;inscription a été reçue et est en cours d&apos;examen. 
          Nous vous contacterons dès que possible pour la validation de votre salon.
        </p>
        {salonId && (
          <Button 
            onClick={() => router.push(`/dashboard/${salonId}`)}
            className="mt-4"
          >
            Aperçu de mon salon
          </Button>
        )}
      </div>
    </Card>
  );
}
