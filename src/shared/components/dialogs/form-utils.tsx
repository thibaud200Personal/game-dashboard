import { Button } from '@/shared/components/ui/button';
import { useLabels } from '@/shared/hooks/useLabels';

export const FormActions = ({ onCancel, mode }: { onCancel: () => void; mode: 'add' | 'edit' }) => {
  const { t } = useLabels();
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        {t('common.buttons.cancel')}
      </Button>
      <Button type="submit">
        {t(`common.buttons.${mode === 'add' ? 'add' : 'edit'}`)}
      </Button>
    </div>
  );
};
