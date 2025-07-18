import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import TicketForm from './components/TicketForm';
import { useTicketStore } from './stores/ticketStore';
import { Ticket } from './types';
import './index.css';

const App: React.FC = () => {
  const [view, setView] = useState<'list' | 'detail' | 'create' | 'edit'>('list');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  
  const { loading, error, fetchTickets, createTicket, updateTicket } = useTicketStore();

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setView('detail');
  };

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setView('edit');
  };

  const handleCreateTicket = () => {
    setView('create');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedTicket(null);
    setEditingTicket(null);
  };

  const handleSubmitTicket = async (data: any) => {
    try {
      if (view === 'create') {
        await createTicket(data);
        setView('list');
      } else if (view === 'edit' && editingTicket) {
        await updateTicket(editingTicket._id, data);
        setView('list');
        setEditingTicket(null);
      }
    } catch (error) {
      console.error('Failed to submit ticket:', error);
    }
  };

  const handleCancelForm = () => {
    setView('list');
    setEditingTicket(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'list' && (
          <TicketList
            onViewTicket={handleViewTicket}
            onEditTicket={handleEditTicket}
            onCreateTicket={handleCreateTicket}
          />
        )}

        {view === 'detail' && selectedTicket && (
          <TicketDetail
            ticket={selectedTicket}
            onBack={handleBackToList}
            onEdit={handleEditTicket}
          />
        )}

        {(view === 'create' || view === 'edit') && (
          <TicketForm
            ticket={editingTicket || undefined}
            onSubmit={handleSubmitTicket}
            onCancel={handleCancelForm}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default App; 