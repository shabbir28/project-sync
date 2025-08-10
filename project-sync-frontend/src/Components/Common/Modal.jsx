import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const Modal = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isOpen = true,
  type = 'confirm', // confirm, warning, error, success
  icon,
  confirmButtonClass,
  children // <-- add this
}) => {
  // Handle escape key to close modal
  useEffect(() => {
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onCancel]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // If modal is not open, return null
  if (!isOpen) return null;

  // Get appropriate colors based on type
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          buttonBg: confirmButtonClass || 'bg-yellow-600',
          buttonHover: confirmButtonClass ? '' : 'hover:bg-yellow-700',
          buttonRing: 'focus:ring-yellow-500',
          icon: icon || <FaExclamationTriangle className="h-6 w-6" />,
        };
      case 'error':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonBg: confirmButtonClass || 'bg-red-600',
          buttonHover: confirmButtonClass ? '' : 'hover:bg-red-700',
          buttonRing: 'focus:ring-red-500',
          icon: icon || <FaExclamationTriangle className="h-6 w-6" />,
        };
      case 'success':
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          buttonBg: confirmButtonClass || 'bg-green-600',
          buttonHover: confirmButtonClass ? '' : 'hover:bg-green-700',
          buttonRing: 'focus:ring-green-500',
          icon: icon || <FaCheckCircle className="h-6 w-6" />,
        };
      case 'confirm':
      default:
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          buttonBg: confirmButtonClass || 'bg-blue-600',
          buttonHover: confirmButtonClass ? '' : 'hover:bg-blue-700',
          buttonRing: 'focus:ring-blue-500',
          icon: icon || <FaCheckCircle className="h-6 w-6" />,
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="relative bg-white rounded-lg max-w-md w-full mx-auto shadow-xl">
        {children ? (
          <div>{children}</div>
        ) : (
          <>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-t-lg">
              <div className="sm:flex sm:items-start">
                {styles.icon && (
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${styles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                    <span className={styles.iconColor}>{styles.icon}</span>
                  </div>
                )}
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {title}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{message}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
              <button
                type="button"
                className={`w-full inline-flex justify-center rounded-md border border-transparent ${confirmButtonClass || `${styles.buttonBg} ${styles.buttonHover}`} px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.buttonRing} sm:ml-3 sm:w-auto sm:text-sm`}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onCancel}
              >
                {cancelText}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  type: PropTypes.oneOf(['confirm', 'warning', 'error', 'success']),
  icon: PropTypes.node,
  confirmButtonClass: PropTypes.string
};

export default Modal; 