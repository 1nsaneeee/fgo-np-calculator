// src/components/EmptyState.jsx
// 统一空状态组件 - icon + title + description + optional CTA
// 用法：<EmptyState icon={<SvgIcon/>} title="..." description="..." cta={<Button>...</Button>} />

export default function EmptyState({ icon, title, description, cta }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <div className="empty-state-title">{title}</div>
      {description && <div className="empty-state-description">{description}</div>}
      {cta && <div className="empty-state-cta">{cta}</div>}
    </div>
  );
}
