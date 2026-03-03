import { FileIcon, ScalesIcon, ShieldIcon } from '@/utils/icons';
import { Clock, Smartphone } from 'lucide-react';
import { CHECKOUT_BENEFITS } from '@/lib/mercadopago-config';

interface BenefitItem {
  icon: string;
  title: string;
  description: string;
}

interface BenefitCardProps {
  benefit: BenefitItem;
}

function BenefitCard({ benefit }: BenefitCardProps) {
  // Render the appropriate icon based on the icon name
  const renderIcon = () => {
    const iconStyle = { color: '#d39e17' };

    switch (benefit.icon) {
      case 'FileText':
        return <FileIcon size="medium" label={benefit.title} />;
      case 'Scale':
        return <ScalesIcon size="medium" label={benefit.title} />;
      case 'Shield':
        return <ShieldIcon size="medium" label={benefit.title} />;
      case 'Clock':
        return <Clock size={20} style={iconStyle} />;
      case 'Smartphone':
        return <Smartphone size={20} style={iconStyle} />;
      default:
        return <FileIcon size="medium" label={benefit.title} />;
    }
  };

  return (
    <div
      className="p-5 rounded-2xl transition-all hover:scale-[1.02]"
      style={{
        background: 'rgba(22, 40, 71, 0.8)',
        border: '1px solid rgba(211, 158, 23, 0.2)',
      }}
    >
      <div className="flex items-start gap-4">
        <span
          className="flex-shrink-0 p-2 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(211, 158, 23, 0.15)' }}
        >
          {renderIcon()}
        </span>
        <div className="flex-1">
          <h3
            className="text-base font-semibold mb-1.5"
            style={{ color: '#f1f5f9' }}
          >
            {benefit.title}
          </h3>
          <p
            className="text-sm leading-relaxed"
            style={{ color: '#94a3b8' }}
          >
            {benefit.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export interface BenefitsListProps {
  benefits?: readonly BenefitItem[];
}

export function BenefitsList({ benefits = CHECKOUT_BENEFITS }: BenefitsListProps) {
  return (
    <div className="space-y-4">
      {benefits.map((benefit, index) => (
        <BenefitCard key={`${benefit.icon}-${index}`} benefit={benefit} />
      ))}
    </div>
  );
}
