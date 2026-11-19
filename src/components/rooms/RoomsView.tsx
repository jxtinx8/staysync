import React, { useState } from 'react';
import {
  BedDouble,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Sparkles,
  Edit2,
  Trash2,
  UserPlus,
  ArrowRightLeft,
  Wind,
  Check,
  X,
  User,
  Info
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Room, RoomStatus, RoomType, Bed } from '../../types';
import { formatINR } from '../../utils/formatters';

interface RoomsViewProps {
  onOpenAdmitStudent: (preselectedRoomId?: string, preselectedBedId?: string) => void;
}

export const RoomsView: React.FC<RoomsViewProps> = ({ onOpenAdmitStudent }) => {
  const { rooms, students, addRoom, updateRoom, deleteRoom, assignStudentToBed, transferStudentBed } = useData();

  // Filters
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [transferModal, setTransferModal] = useState<{
    isOpen: boolean;
    studentId: string;
    studentName: string;
    currentRoom: string;
    currentBed: string;
  }>({
    isOpen: false,
    studentId: '',
    studentName: '',
    currentRoom: '',
    currentBed: '',
  });

  const [transferTarget, setTransferTarget] = useState<{ roomId: string; bedId: string }>({ roomId: '', bedId: '' });
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State for Add / Edit
  const [formRoomNumber, setFormRoomNumber] = useState('');
  const [formFloor, setFormFloor] = useState(1);
  const [formCapacity, setFormCapacity] = useState(2);
  const [formRent, setFormRent] = useState(10000);
  const [formType, setFormType] = useState<RoomType>('AC');
  const [formStatus, setFormStatus] = useState<RoomStatus>('Available');
  const [formAmenities, setFormAmenities] = useState<string[]>([
    'High-speed Wi-Fi',
    'Attached Bathroom',
    'Geyser',
    'Study Desk',
  ]);
  const [formDescription, setFormDescription] = useState('');

  const commonAmenities = [
    'High-speed Wi-Fi',
    'Attached Bathroom',
    'Geyser',
    'Study Desk',
    'Balcony',
    'Individual Wardrobe',
    'Smart TV',
    'Refrigerator',
    'Ceiling Fan',
    'Daily Cleaning',
  ];

  // Filtered rooms
  const filteredRooms = rooms.filter(room => {
    if (selectedFloor !== 'all' && room.floor !== selectedFloor) return false;
    if (selectedStatus !== 'all' && room.status !== selectedStatus) return false;
    if (selectedType !== 'all' && room.type !== selectedType) return false;
    return true;
  });

  // Aggregate stats
  const totalRoomsCount = rooms.length;
  const totalBedsCount = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const totalOccupiedBeds = rooms.reduce((acc, r) => acc + r.beds.filter(b => b.isOccupied).length, 0);
  const totalVacantBeds = totalBedsCount - totalOccupiedBeds;

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const openAddModal = () => {
    setEditingRoom(null);
    setFormRoomNumber('');
    setFormFloor(1);
    setFormCapacity(2);
    setFormRent(10000);
    setFormType('AC');
    setFormStatus('Available');
    setFormAmenities(['High-speed Wi-Fi', 'Attached Bathroom', 'Geyser', 'Study Desk']);
    setFormDescription('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormRoomNumber(room.roomNumber);
    setFormFloor(room.floor);
    setFormCapacity(room.capacity);
    setFormRent(room.rentPerBed);
    setFormType(room.type);
    setFormStatus(room.status);
    setFormAmenities(room.amenities || []);
    setFormDescription(room.description || '');
    setIsAddModalOpen(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoomNumber.trim()) {
      showFeedback('error', 'Room number is required.');
      return;
    }

    if (editingRoom) {
      const res = updateRoom({
        ...editingRoom,
        roomNumber: formRoomNumber.trim(),
        floor: Number(formFloor),
        capacity: Number(formCapacity),
        rentPerBed: Number(formRent),
        type: formType,
        status: formStatus,
        amenities: formAmenities,
        description: formDescription,
      });
      if (res.success) {
        showFeedback('success', res.message);
        setIsAddModalOpen(false);
      } else {
        showFeedback('error', res.message);
      }
    } else {
      const res = addRoom({
        roomNumber: formRoomNumber.trim(),
        floor: Number(formFloor),
        capacity: Number(formCapacity),
        rentPerBed: Number(formRent),
        type: formType,
        amenities: formAmenities,
        description: formDescription,
      });
      if (res.success) {
        showFeedback('success', res.message);
        setIsAddModalOpen(false);
      } else {
        showFeedback('error', res.message);
      }
    }
  };

  const handleDeleteRoom = (roomId: string) => {
    if (window.confirm('Are you sure you want to delete this room? This cannot be undone.')) {
      const res = deleteRoom(roomId);
      if (res.success) {
        showFeedback('success', res.message);
      } else {
        showFeedback('error', res.message);
      }
    }
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTarget.roomId || !transferTarget.bedId) {
      showFeedback('error', 'Please select target room and bed.');
      return;
    }
    const res = transferStudentBed(transferModal.studentId, transferTarget.roomId, transferTarget.bedId);
    if (res.success) {
      showFeedback('success', res.message);
      setTransferModal({ isOpen: false, studentId: '', studentName: '', currentRoom: '', currentBed: '' });
      setTransferTarget({ roomId: '', bedId: '' });
    } else {
      showFeedback('error', res.message);
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (formAmenities.includes(amenity)) {
      setFormAmenities(formAmenities.filter(a => a !== amenity));
    } else {
      setFormAmenities([...formAmenities, amenity]);
    }
  };

  // Get available vacant beds list across all rooms for transfer
  const allVacantBeds: { roomId: string; roomNumber: string; bedId: string; bedNumber: string; rent: number; type: RoomType }[] = [];
  rooms.forEach(r => {
    r.beds.forEach(b => {
      if (!b.isOccupied) {
        allVacantBeds.push({
          roomId: r.id,
          roomNumber: r.roomNumber,
          bedId: b.id,
          bedNumber: b.bedNumber,
          rent: r.rentPerBed,
          type: r.type,
        });
      }
    });
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-subtle animate-in fade-in ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header & Metric summary cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Room & Bed Inventory</h2>
          <p className="text-xs text-slate-500">
            Manage floor layouts, capacity allocations and student bed assignments.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Room</span>
        </button>
      </div>

      {/* Quick stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-medium text-slate-500">Total Rooms</span>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{totalRoomsCount}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-medium text-slate-500">Total Bed Capacity</span>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{totalBedsCount} Beds</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-medium text-slate-500">Occupied Beds</span>
          <div className="text-xl font-bold text-brand-600 mt-0.5">{totalOccupiedBeds} Beds</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-subtle">
          <span className="text-[11px] font-medium text-slate-500">Vacant Beds Available</span>
          <div className="text-xl font-bold text-emerald-600 mt-0.5">{totalVacantBeds} Beds</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Floor selector tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-slate-400 font-semibold mr-1">Floor:</span>
          {(['all', 1, 2, 3] as const).map(floor => (
            <button
              key={floor}
              onClick={() => setSelectedFloor(floor)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedFloor === floor
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {floor === 'all' ? 'All Floors' : `Floor ${floor}`}
            </button>
          ))}
        </div>

        {/* Dropdowns for Type & Status */}
        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All AC / Non-AC</option>
            <option value="AC">AC Rooms</option>
            <option value="Non-AC">Non-AC Rooms</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Partially Occupied">Partially Occupied</option>
            <option value="Fully Occupied">Fully Occupied</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Visual Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredRooms.map(room => {
          const occupiedCount = room.beds.filter(b => b.isOccupied).length;
          const isFull = occupiedCount === room.capacity;
          const isMaintenance = room.status === 'Maintenance';

          return (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Room Card Header */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-slate-900 tracking-tight">
                        Room {room.roomNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          room.type === 'AC'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {room.type}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">Floor {room.floor}</span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      {room.capacity}-Sharing • <span className="font-semibold text-slate-800">{formatINR(room.rentPerBed)}</span> / bed
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      isMaintenance
                        ? 'bg-slate-100 text-slate-700'
                        : isFull
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : occupiedCount > 0
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {room.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Occupancy ({occupiedCount}/{room.capacity})</span>
                    <span>{Math.round((occupiedCount / room.capacity) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFull ? 'bg-rose-500' : occupiedCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${(occupiedCount / room.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Visual Beds Slot Layout */}
              <div className="p-4 bg-slate-50/50 flex-1 space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Assigned Beds
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {room.beds.map(bed => {
                    return (
                      <div
                        key={bed.id}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                          bed.isOccupied
                            ? 'bg-white border-slate-200 shadow-sm'
                            : 'bg-emerald-50/40 border-dashed border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                              bed.isOccupied
                                ? 'bg-brand-100 text-brand-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {bed.bedNumber.replace('Bed ', '')}
                          </div>

                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{bed.bedNumber}</span>
                              {bed.isOccupied ? (
                                <span className="text-[10px] text-brand-700 font-medium px-1.5 py-0.2 rounded bg-brand-50 border border-brand-200">
                                  Occupied
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-700 font-medium px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200">
                                  Vacant
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {bed.isOccupied ? (
                                <span className="font-medium text-slate-800">{bed.studentName}</span>
                              ) : (
                                <span className="text-emerald-600">Ready for admission</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bed Action buttons */}
                        <div className="flex items-center gap-1">
                          {bed.isOccupied ? (
                            <button
                              onClick={() => {
                                setTransferModal({
                                  isOpen: true,
                                  studentId: bed.studentId || '',
                                  studentName: bed.studentName || '',
                                  currentRoom: room.roomNumber,
                                  currentBed: bed.bedNumber,
                                });
                                setTransferTarget({ roomId: '', bedId: '' });
                              }}
                              className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-brand-600 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors flex items-center gap-1"
                              title="Transfer student to another bed"
                            >
                              <ArrowRightLeft className="h-3 w-3" />
                              <span>Transfer</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onOpenAdmitStudent(room.id, bed.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                            >
                              <UserPlus className="h-3 w-3" />
                              <span>Allocate</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Amenities tags & Room Actions Footer */}
              <div className="p-4 border-t border-slate-100 bg-white">
                <div className="flex flex-wrap gap-1 mb-3">
                  {room.amenities?.slice(0, 3).map((a, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium"
                    >
                      {a}
                    </span>
                  ))}
                  {(room.amenities?.length || 0) > 3 && (
                    <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md">
                      +{(room.amenities?.length || 0) - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => openEditModal(room)}
                    className="text-slate-600 hover:text-brand-600 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit Room</span>
                  </button>

                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="text-slate-400 hover:text-rose-600 font-medium flex items-center gap-1 transition-colors"
                    title="Delete Room"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredRooms.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200">
            <BedDouble className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">No rooms found</h4>
            <p className="text-xs text-slate-500 mt-1">Try clearing your floor or status filter.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Room Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-modal border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingRoom ? `Edit Room ${editingRoom.roomNumber}` : 'Add New Room'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 104, 205"
                    value={formRoomNumber}
                    onChange={(e) => setFormRoomNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Floor Level *</label>
                  <select
                    value={formFloor}
                    onChange={(e) => setFormFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value={1}>Floor 1 (Ground)</option>
                    <option value={2}>Floor 2</option>
                    <option value={3}>Floor 3</option>
                    <option value={4}>Floor 4</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity (Beds) *</label>
                  <select
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value={1}>1 Sharing (Private)</option>
                    <option value={2}>2 Sharing</option>
                    <option value={3}>3 Sharing</option>
                    <option value={4}>4 Sharing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rent / Bed (₹) *</label>
                  <input
                    type="number"
                    required
                    step={100}
                    placeholder="10000"
                    value={formRent}
                    onChange={(e) => setFormRent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as RoomType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="AC">AC</option>
                    <option value="Non-AC">Non-AC</option>
                  </select>
                </div>
              </div>

              {editingRoom && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operational Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as RoomStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Partially Occupied">Partially Occupied</option>
                    <option value="Fully Occupied">Fully Occupied</option>
                    <option value="Maintenance">Maintenance (Off-market)</option>
                  </select>
                </div>
              )}

              {/* Amenities Checkboxes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Amenities & Facilities</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {commonAmenities.map((amenity) => {
                    const checked = formAmenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`flex items-center gap-2 p-1.5 rounded text-left transition-colors ${
                          checked ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded flex items-center justify-center border ${
                            checked ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300'
                          }`}
                        >
                          {checked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{amenity}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Location Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Spacious corner room, north facing with garden balcony..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
                >
                  {editingRoom ? 'Save Changes' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bed Transfer Modal */}
      {transferModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-modal border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-brand-600">
                <ArrowRightLeft className="h-5 w-5" />
                <h3 className="font-bold text-slate-900 text-base">Transfer Student Bed</h3>
              </div>
              <button
                onClick={() => setTransferModal({ isOpen: false, studentId: '', studentName: '', currentRoom: '', currentBed: '' })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-800">{transferModal.studentName}</div>
                <div className="text-slate-500 mt-0.5">
                  Currently in Room {transferModal.currentRoom} ({transferModal.currentBed})
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Target Vacant Bed *
                </label>
                <select
                  required
                  value={`${transferTarget.roomId}|${transferTarget.bedId}`}
                  onChange={(e) => {
                    const [rId, bId] = e.target.value.split('|');
                    setTransferTarget({ roomId: rId || '', bedId: bId || '' });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">-- Choose available bed --</option>
                  {allVacantBeds.map(vb => (
                    <option key={`${vb.roomId}-${vb.bedId}`} value={`${vb.roomId}|${vb.bedId}`}>
                      Room {vb.roomNumber} ({vb.bedNumber}) - {vb.type} • {formatINR(vb.rent)}/mo
                    </option>
                  ))}
                </select>
                {allVacantBeds.length === 0 && (
                  <p className="text-[11px] text-rose-500 mt-1">No vacant beds available right now.</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTransferModal({ isOpen: false, studentId: '', studentName: '', currentRoom: '', currentBed: '' })}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!transferTarget.roomId || !transferTarget.bedId}
                  className="px-5 py-2 font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-lg shadow-sm"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
