'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Search, Bell, Plus, Grid, List, Upload, Folder,
  Headphones, Video, Image, FileText, Download, MoreHorizontal,
  Star, Trash2, Eye, ChevronRight, X, Filter, SortAsc
} from 'lucide-react';

const mediaFiles = [
  { id: 1, name: 'Kurdish Alphabet Audio', filename: 'kurdish-alphabet-audio.mp3', type: 'Audio', size: '2.4 MB', duration: '2:34', uploaded: '2 hours ago', by: 'Hosen Ahmed', category: 'Alphabet', tags: ['alphabet', 'audio', 'kurdish'], desc: 'Audio pronunciation for Kurdish alphabet letters.' },
  { id: 2, name: 'Lesson Introduction', filename: 'lesson-intro-video.mp4', type: 'Video', size: '45.2 MB', duration: '5:20', uploaded: '5 hours ago', by: 'Hosen Ahmed', category: 'Introduction', tags: ['intro', 'video'], desc: 'Introduction video for new lessons.' },
  { id: 3, name: 'Kurdish Nature Scene', filename: 'kurdish-nature.jpg', type: 'Image', size: '3.1 MB', duration: null, uploaded: '1 day ago', by: 'Hosen Ahmed', category: 'Background', tags: ['image', 'nature'], desc: 'Beautiful Kurdish nature background image.' },
  { id: 4, name: 'Grammar Guide PDF', filename: 'grammar-guide.pdf', type: 'Document', size: '1.8 MB', duration: null, uploaded: '2 days ago', by: 'Admin', category: 'Grammar', tags: ['grammar', 'pdf'], desc: 'Comprehensive Kurdish grammar guide.' },
  { id: 5, name: 'Common Phrases Audio', filename: 'common-phrases.mp3', type: 'Audio', size: '3.7 MB', duration: '3:45', uploaded: '2 days ago', by: 'Hosen Ahmed', category: 'Phrases', tags: ['phrases', 'audio'], desc: 'Audio recordings of common Kurdish phrases.' },
  { id: 6, name: 'Traditional Houses', filename: 'traditional-houses.png', type: 'Image', size: '2.9 MB', duration: null, uploaded: '3 days ago', by: 'Admin', category: 'Culture', tags: ['culture', 'image'], desc: 'Images of traditional Kurdish architecture.' },
  { id: 7, name: 'Culture Documentary', filename: 'culture-doc.mp4', type: 'Video', size: '120 MB', duration: '15:30', uploaded: '3 days ago', by: 'Admin', category: 'Culture', tags: ['culture', 'video'], desc: 'Documentary about Kurdish culture.' },
  { id: 8, name: 'Kurdish Text Sample', filename: 'text-sample.jpg', type: 'Image', size: '1.2 MB', duration: null, uploaded: '4 days ago', by: 'Admin', category: 'Text', tags: ['text', 'image'], desc: 'Sample Kurdish text for learning.' },
];

const typeColors: Record<string, string> = {
  Audio: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Video: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Image: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Document: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const typeIcons: Record<string, React.ReactNode> = {
  Audio: <Headphones className="w-5 h-5" />,
  Video: <Video className="w-5 h-5" />,
  Image: <Image className="w-5 h-5" />,
  Document: <FileText className="w-5 h-5" />,
};

export default function MediaLibraryPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<number | null>(1);
  const [filterType, setFilterType] = useState('All Types');
  const [search, setSearch] = useState('');

  const filtered = mediaFiles.filter(f =>
    (filterType === 'All Types' || f.type === filterType) &&
    (search === '' || f.name.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedFile = mediaFiles.find(f => f.id === selected);

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      {/* Top bar */}
      <div className="bg-[#0d1f38] border-b border-white/6 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/en/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">KURDAMUZ</span>
          </Link>
          <div className="w-px h-6 bg-white/10" />
          <div>
            <div className="text-base font-bold text-white">Media Library</div>
            <div className="text-xs text-slate-400">Manage and organize your learning content</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search media..."
              className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 w-64 focus:outline-none focus:border-emerald-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-600">
              <span className="text-xs">⌘ K</span>
            </div>
          </div>
          <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center cursor-pointer">
            <Bell className="w-4 h-4 text-slate-400" />
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20">
            <Upload className="w-3.5 h-3.5" />
            Upload Media
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Upload + Gallery */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Drop Zone */}
          <div className="border-2 border-dashed border-white/10 hover:border-emerald-500/40 rounded-2xl p-8 mb-6 text-center transition-all group cursor-pointer">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500/15 transition-all">
              <Upload className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-sm text-slate-300 mb-1">
              Drag &amp; drop files here or <span className="text-emerald-400 font-semibold">click to browse</span>
            </p>
            <p className="text-xs text-slate-500">Supports: Images, Audio, Video, Documents (Max 2GB per file)</p>
          </div>

          {/* Filters + View Toggle */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="bg-[#0d1f38] border border-white/10 text-sm text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
              >
                {['All Types', 'Audio', 'Video', 'Image', 'Document'].map(t => <option key={t}>{t}</option>)}
              </select>
              <select className="bg-[#0d1f38] border border-white/10 text-sm text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500">
                <option>All Categories</option>
                <option>Alphabet</option>
                <option>Grammar</option>
                <option>Culture</option>
              </select>
              <select className="bg-[#0d1f38] border border-white/10 text-sm text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500">
                <option>Recently Added</option>
                <option>Name A-Z</option>
                <option>Largest First</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('grid')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${view === 'grid' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${view === 'list' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {view === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(file => (
                <div
                  key={file.id}
                  onClick={() => setSelected(file.id)}
                  className={`bg-[#0d1f38] border rounded-xl overflow-hidden cursor-pointer hover:scale-[1.01] transition-all group ${selected === file.id ? 'border-emerald-500/50' : 'border-white/8'}`}
                >
                  <div className="h-32 bg-[#0f2440] flex items-center justify-center relative">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColors[file.type]?.split(' ').slice(0, 1).join(' ')}`}>
                      {typeIcons[file.type]}
                    </div>
                    <div className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full border ${typeColors[file.type]}`}>
                      {file.type}
                    </div>
                    <button className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium text-white truncate mb-1">{file.name}</div>
                    <div className="text-xs text-slate-500">{file.size} · {file.uploaded}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0d1f38] border border-white/8 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-white/6 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <div className="col-span-2">File Name</div>
                <div>Type</div>
                <div>Size</div>
                <div>Uploaded By</div>
                <div>Actions</div>
              </div>
              {filtered.map(file => (
                <div
                  key={file.id}
                  onClick={() => setSelected(file.id)}
                  className={`grid grid-cols-6 gap-4 px-4 py-3 border-b border-white/4 last:border-0 cursor-pointer hover:bg-white/3 transition-all ${selected === file.id ? 'bg-emerald-500/5' : ''}`}
                >
                  <div className="col-span-2 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${typeColors[file.type]}`}>
                      {typeIcons[file.type]}
                    </div>
                    <span className="text-sm text-white font-medium truncate">{file.filename}</span>
                  </div>
                  <div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${typeColors[file.type]}`}>{file.type}</span>
                  </div>
                  <div className="text-sm text-slate-400 self-center">{file.size}</div>
                  <div className="text-sm text-slate-400 self-center">{file.by}</div>
                  <div className="flex items-center gap-2">
                    <button className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all">
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center hover:bg-red-500/15 transition-all">
                      <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel: Upload Queue + File Details */}
        <div className="w-72 bg-[#0d1f38] border-l border-white/6 p-5 overflow-auto shrink-0">
          {/* Upload Queue */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-white mb-3">Upload Queue</h3>
            <div className="space-y-2">
              {[
                { name: 'kurdish-alphabet-audio.mp3', progress: 45, color: 'bg-emerald-400' },
                { name: 'lesson-intro-video.mp4', progress: 78, color: 'bg-blue-400' },
                { name: 'kurdish-words-image.png', progress: 100, color: 'bg-emerald-400', done: true },
                { name: 'grammar-guide.pdf', progress: 0, color: 'bg-slate-600', pending: true },
              ].map((item, i) => (
                <div key={i} className="bg-white/3 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white font-medium truncate flex-1">{item.name}</span>
                    {item.done ? <span className="text-xs text-emerald-400 ml-1">✓</span> : item.pending ? <span className="text-xs text-slate-500 ml-1">⏳</span> : null}
                  </div>
                  <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.progress}%` }} />
                  </div>
                  <div className="text-xs text-slate-500 mt-1 text-right">{item.pending ? 'Pending' : `${item.progress}%`}</div>
                </div>
              ))}
            </div>
          </div>

          {/* File Details */}
          {selectedFile && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Media Details</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs font-medium px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Assign to Lesson</span>
                </div>
              </div>

              {/* Preview */}
              <div className="h-28 bg-white/3 rounded-xl mb-4 flex items-center justify-center border border-white/5">
                {selectedFile.type === 'Audio' && (
                  <div className="text-center">
                    <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Headphones className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      {Array.from({length: 20}).map((_, i) => (
                        <div key={i} className="w-0.5 bg-emerald-400 rounded-full opacity-70" style={{ height: `${Math.random() * 20 + 8}px` }} />
                      ))}
                    </div>
                    <div className="text-xs text-slate-400">0:00 / {selectedFile.duration}</div>
                  </div>
                )}
                {selectedFile.type !== 'Audio' && (
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${typeColors[selectedFile.type]}`}>
                    {typeIcons[selectedFile.type]}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-2.5 mb-4">
                {[
                  { label: 'Name', value: selectedFile.filename },
                  { label: 'Type', value: `${selectedFile.type} (${selectedFile.type === 'Audio' ? 'MP3' : selectedFile.type === 'Video' ? 'MP4' : selectedFile.type === 'Image' ? 'JPG/PNG' : 'PDF'})` },
                  { label: 'Size', value: selectedFile.size },
                  { label: 'Duration', value: selectedFile.duration || 'N/A' },
                  { label: 'Uploaded', value: selectedFile.uploaded },
                  { label: 'Uploaded by', value: selectedFile.by },
                  { label: 'Category', value: selectedFile.category },
                ].map((item) => (
                  <div key={item.label} className="flex items-start justify-between gap-2">
                    <span className="text-xs text-slate-500 shrink-0">{item.label}</span>
                    <span className="text-xs text-white text-right">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="mb-4">
                <div className="text-xs text-slate-500 mb-2">Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedFile.tags.map(tag => (
                    <span key={tag} className="text-xs bg-white/5 border border-white/10 text-slate-400 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                  <button className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">+ Add</button>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <div className="text-xs text-slate-500 mb-2">Description</div>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedFile.desc}</p>
              </div>

              <button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all">
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
