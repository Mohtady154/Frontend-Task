import React from 'react'
import ActionButton from '../ActionButton/ActionButton'
import pencil from '../../assets/Pencil.png'
import trash from '../../assets/Bin.png'
import { useAuth } from '../../context/AuthContext'

const TableActions = ({ row, onEdit, onDelete }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex space-x-2">
      <ActionButton
        icon={pencil}
        action={() => onEdit(row)}
        disabled={!isAuthenticated}
      />
      <ActionButton
        icon={trash}
        action={onDelete}
        className="bg-red-500 hover:bg-red-600"
        disabled={!isAuthenticated}
      />
    </div>
  )
}
export default TableActions;