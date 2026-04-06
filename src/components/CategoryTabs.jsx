import DieIcon from './DieIcon.jsx';
import { MapIcon, LandmarkIcon, PackIcon } from './Icons.jsx';

const TABS = [
  { id: 'factions',  label: 'Factions',      icon: DieIcon },
  { id: 'map',       label: 'Map & Cards',   icon: MapIcon },
  { id: 'hirelings', label: 'Hirelings',     icon: PackIcon },
  { id: 'landmarks', label: 'Landmarks',     icon: LandmarkIcon },
];

export default function CategoryTabs({ activeTab, onTabChange, disabledTabs }) {
  return (
    <nav className="category-tabs" role="tablist" aria-label="Categories">
      {TABS.map(tab => {
        const Icon = tab.icon;
        const disabled = disabledTabs?.has(tab.id);
        return (
          <button
            key={tab.id}
            className={`category-tab ${activeTab === tab.id ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="category-tab-icon"><Icon width={14} height={14} /></span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
