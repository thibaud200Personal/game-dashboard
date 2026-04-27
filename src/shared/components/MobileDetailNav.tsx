import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { ArrowLeft, Plus } from '@phosphor-icons/react';
import { useLabels } from '@/shared/hooks/useLabels';

interface MobileDetailNavProps {
  embedded: boolean;
  onBack: () => void;
  onAdd: () => void;
}

export default function MobileDetailNav({ embedded, onBack, onAdd }: MobileDetailNavProps) {
  const { t } = useLabels();

  if (embedded) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden">
      <div className="bg-slate-100 border-t border-slate-300 dark:bg-slate-800 dark:border-t dark:border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.buttons.back')}
          </Button>
          <Button onClick={onAdd}>
            <Plus className="w-4 h-4 mr-2" />
            {t('common.buttons.add')}
          </Button>
        </div>
      </div>
    </div>
  );
}
