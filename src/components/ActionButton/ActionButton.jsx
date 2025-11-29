import React from 'react'

const ActionButton = ({
  icon,
  action,
  disabled = false,
  className = ''
}) => {
  return (
    <button
      onClick={disabled ? undefined : action}
      className={`${className || 'bg-main'} grid place-items-center w-10 h-10 pointer-cursor ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
    >

      <img src={icon} alt="Action" className="w-4 h-4" />
    </button>
  )
}

export default ActionButton