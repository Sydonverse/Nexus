import React, { useState } from 'react';
import {
  FolderGit2,
  Search,
  Upload,
  Download,
  Trash2,
  FileCode,
  FileText,
  FileArchive,
  Film,
  Layers,
} from 'lucide-react';
import { Resource, ResourceCategory, DepartmentMemberContext } from '../types';

interface ResourcesViewProps {
  resources: Resource[];
  activeDept: DepartmentMemberContext;
  isTutorOrAdmin: boolean;
  onOpenUpload: () => void;
  onDeleteResource: (id: string) => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  activeDept,
  isTutorOrAdmin,
  onOpenUpload,
  onDeleteResource,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: ResourceCategory[] = [
    'ALL',
    'LECTURE',
    'TUTORIAL',
    'EXERCISE',
    'REFERENCE',
    'TOOL',
    'OTHER',
  ];

  const filteredResources = resources.filter((res) => {
    const matchesCategory =
      selectedCategory === 'ALL' || res.category === selectedCategory;
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.tags && res.tags.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf') || mimeType.includes('text')) {
      return <FileText size={24} className="text-accent" />;
    }
    if (mimeType.includes('video')) {
      return <Film size={24} className="text-accent" />;
    }
    if (mimeType.includes('zip') || mimeType.includes('compressed')) {
      return <FileArchive size={24} className="text-accent" />;
    }
    if (mimeType.includes('javascript') || mimeType.includes('python') || mimeType.includes('shell')) {
      return <FileCode size={24} className="text-accent" />;
    }
    return <Layers size={24} className="text-accent" />;
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Learning Resources & Materials</h1>
          <p className="view-subtitle">
            Curated study guides, lab exercise archives, software tools, and reference documentation for {activeDept.name}.
          </p>
        </div>
        {isTutorOrAdmin && (
          <button className="btn-primary" onClick={onOpenUpload}>
            <Upload size={16} />
            <span>Upload New Resource</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar glass-panel">
        <div className="search-box">
          <Search size={18} className="text-muted" />
          <input
            type="text"
            className="search-input"
            placeholder="Search resources by title, topic, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
              style={
                selectedCategory === cat
                  ? { background: activeDept.colorHex, borderColor: activeDept.colorHex }
                  : {}
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Cards Grid */}
      {filteredResources.length === 0 ? (
        <div className="empty-state-card glass-panel">
          <FolderGit2 size={48} className="text-muted" />
          <h3>No learning resources found</h3>
          <p className="text-muted">
            {searchQuery
              ? `No resources match your query "${searchQuery}".`
              : 'Tutors have not uploaded resources in this category yet.'}
          </p>
          {isTutorOrAdmin && (
            <button className="btn-primary mt-4" onClick={onOpenUpload}>
              <Upload size={16} />
              <span>Upload First Resource</span>
            </button>
          )}
        </div>
      ) : (
        <div className="resources-grid">
          {filteredResources.map((res) => (
            <div key={res.id} className="resource-card glass-panel glass-panel-hover">
              <div className="resource-card-header">
                <div className="resource-icon-box">{getFileIcon(res.fileMimeType)}</div>
                <div className="resource-card-actions">
                  <span className="badge badge-normal">{res.category}</span>
                  {isTutorOrAdmin && (
                    <button
                      className="btn-icon btn-icon-danger"
                      onClick={() => onDeleteResource(res.id)}
                      title="Delete resource"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="resource-title">{res.title}</h3>
              <p className="resource-description">{res.description}</p>

              {res.tags && (
                <div className="resource-tags">
                  {res.tags.split(',').map((tag, i) => (
                    <span key={i} className="resource-tag">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              <div className="resource-footer">
                <div className="resource-meta">
                  <div className="resource-size">
                    {(res.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                  </div>
                  <div className="resource-uploader">
                    by {res.uploader?.firstName} {res.uploader?.lastName}
                  </div>
                </div>

                <a
                  href={`http://localhost:4000${res.fileUrl}`}
                  download={res.fileName}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary btn-sm"
                >
                  <Download size={14} />
                  <span>Download</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
