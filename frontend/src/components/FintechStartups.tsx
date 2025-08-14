import React, { useEffect, useState } from 'react';
import { Plus, Building2, Globe, Calendar, User, Search, Filter } from 'lucide-react';
import type { FintechStartup } from '../types';
import * as XLSX from 'xlsx';

interface FintechStartupsProps {
  currentUser: any;
  selectedYear?: number;
}

export const FintechStartups: React.FC<FintechStartupsProps> = ({ currentUser, selectedYear }) => {
  // Add custom CSS for perfect card alignment
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .startup-card {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 450px;
        background-color: #ffffff;
        color: #111827;
      }
      .startup-card .card-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .startup-card .card-footer {
        margin-top: auto;
        padding-top: 1.5rem;
        border-top: 2px solid #f3f4f6;
      }
      .startup-grid {
        align-items: stretch;
      }
      .startup-grid > * {
        height: 100%;
      }
      .startup-card .h-16 { height: 4rem; }
      .startup-card .h-20 { height: 5rem; }
      .startup-card .h-24 { height: 6rem; }
      .startup-card .h-10 { height: 2.5rem; }
      .startup-grid {
        grid-template-rows: repeat(auto-fill, minmax(400px, 1fr));
      }
      .startup-card {
        grid-row: span 1;
      }
      .startup-card .card-footer .flex {
        align-items: center;
        justify-content: space-between;
      }
      .startup-card .card-footer button,
      .startup-card .card-footer a {
        flex: 1;
        margin: 0;
      }
      .startup-card .card-footer .gap-3 {
        gap: 0.75rem;
      }
      .startup-card .space-y-3 > * + * {
        margin-top: 0.75rem;
      }
      .startup-card .sector-tag {
        display: inline-block;
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        border-radius: 9999px;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
        margin: 0.25rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 150px;
        transition: all 0.2s ease-in-out;
      }
      .startup-card .sector-tag:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15);
      }
      .startup-card .info-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #f9fafb;
        border-radius: 0.5rem;
        padding: 1rem;
        margin-bottom: 1.5rem;
        border: 1px solid #e5e7eb;
      }
      .startup-card .sectors-section {
        margin-bottom: 2rem;
        padding: 1rem 0;
      }
      .startup-card .description-section {
        margin-top: 1.5rem;
        padding: 1rem 0;
      }
      .startup-card .section-divider {
        height: 2px;
        background-color: #e5e7eb;
        margin: 1.5rem 0;
        opacity: 0.6;
        border-radius: 1px;
      }
      .startup-card .sectors-container {
        background-color: #f8fafc;
        border-radius: 0.75rem;
        padding: 1rem;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
      }
      .startup-card .info-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: #1f2937;
        padding: 0.5rem;
        border-radius: 0.5rem;
        transition: all 0.2s ease-in-out;
      }
      .startup-card .info-item:hover {
        background-color: #f3f4f6;
        transform: translateX(2px);
      }
      .startup-card .button-row {
        display: flex;
        gap: 0.75rem;
        width: 100%;
        margin-top: auto;
        padding-top: 1.5rem;
        border-top: 2px solid #f3f4f6;
      }
      .startup-card .button-left {
        flex: 1;
        background-color: #059669;
        color: white;
        padding: 1rem;
        border-radius: 0.75rem;
        font-weight: 600;
        font-size: 0.875rem;
        text-align: center;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease-in-out;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
      }
      .startup-card .button-right {
        flex: 1;
        background-color: #dc2626;
        color: white;
        padding: 1rem;
        border-radius: 0.75rem;
        font-weight: 600;
        font-size: 0.875rem;
        text-align: center;
        border: none;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease-in-out;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
      }
      .startup-card .button-left:hover {
        background-color: #047857;
        transform: translateY(-2px);
        box-shadow: 0 6px 12px -1px rgba(0, 0, 0, 0.15);
      }
      .startup-card .button-right:hover {
        background-color: #b91c1c;
        transform: translateY(-2px);
        box-shadow: 0 6px 12px -1px rgba(0, 0, 0, 0.15);
      }
      @media (max-width: 640px) {
        .startup-card .button-row {
          flex-direction: column;
          gap: 0.5rem;
        }
        .startup-card .button-left,
        .startup-card .button-right {
          width: 100%;
        }
        .startup-card .info-row {
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-start;
        }
        .startup-card .sector-tag {
          max-width: 120px;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
        }
        .startup-card {
          padding: 1rem;
        }
        .startup-grid {
          grid-template-columns: 1fr;
          gap: 1.5rem;
          padding: 0.5rem;
        }
      }
      @media (min-width: 641px) and (max-width: 1024px) {
        .startup-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 1.75rem;
          padding: 1.5rem;
        }
      }
      @media (min-width: 1025px) {
        .startup-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          padding: 2rem;
        }
      }
      .startup-card {
        animation: fadeInUp 0.4s ease-out;
      }
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .startup-card:hover {
        animation: none;
      }
      .startup-card .button-left:focus,
      .startup-card .button-right:focus {
        outline: 3px solid #3b82f6;
        outline-offset: 3px;
      }
      .startup-card .button-left:active,
      .startup-card .button-right:active {
        transform: translateY(0);
        box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.1);
      }
      .startup-card .loading {
        opacity: 0.7;
        pointer-events: none;
      }
      .startup-card .loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 24px;
        height: 24px;
        margin: -12px 0 0 -12px;
        border: 3px solid #f3f4f6;
        border-top: 3px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .startup-card .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      .startup-card .focus-visible:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
      .startup-card .focus-visible:focus:not(:focus-visible) {
        outline: none;
      }
      @media print {
        .startup-card {
          break-inside: avoid;
          page-break-inside: avoid;
          box-shadow: none;
          border: 2px solid #000;
          background-color: white;
          color: black;
        }
        .startup-card .card-footer {
          display: none;
        }
        .startup-card .focus-ring {
          display: none;
        }
        .startup-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          padding: 1rem;
        }
      }

      @media (prefers-contrast: high) {
        .startup-card {
          border-width: 2px;
          border-color: #000;
        }
        .startup-card .button-left,
        .startup-card .button-right {
          border: 2px solid #000;
        }
        .startup-card .sector-tag {
          border: 1px solid #000;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .startup-card {
          animation: none;
          transition: none;
        }
        .startup-card:hover {
          transform: none;
        }
        .startup-card .button-left:hover,
        .startup-card .button-right:hover {
          transform: none;
        }
      }
      .startup-card .focus-visible {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
      .startup-card .focus-visible:not(:focus-visible) {
        outline: none;
      }
      .startup-card .focus-visible:focus-visible {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
      .startup-card .loading-state {
        position: relative;
        opacity: 0.7;
        pointer-events: none;
      }
      .startup-card .loading-state::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 24px;
        height: 24px;
        margin: -12px 0 0 -12px;
        border: 3px solid #f3f4f6;
        border-top: 3px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      .startup-card .loading-state .card-content {
        filter: blur(1px);
      }
      .startup-card .loading-state .sectors-section {
        filter: blur(0.5px);
      }
      .startup-card .loading-state .description-section {
        filter: blur(0.5px);
      }
      .startup-card .error-state {
        border-color: #dc2626;
        background-color: #fef2f2;
      }
      .startup-card .error-state .error-message {
        color: #dc2626;
        font-weight: 600;
        text-align: center;
        padding: 1.25rem;
        background-color: #fee2e2;
        border-radius: 0.75rem;
        margin: 1.5rem 0;
        border: 1px solid #fecaca;
      }
      .startup-card .error-state .error-icon {
        color: #dc2626;
        width: 24px;
        height: 24px;
        margin: 0 auto 0.5rem;
        display: block;
      }
      .startup-card .success-state {
        border-color: #059669;
        background-color: #f0fdf4;
      }
      .startup-card .success-state .success-message {
        color: #059669;
        font-weight: 600;
        text-align: center;
        padding: 1.25rem;
        background-color: #dcfce7;
        border-radius: 0.75rem;
        margin: 1.5rem 0;
        border: 1px solid #bbf7d0;
      }
      .startup-card .success-state .success-icon {
        color: #059669;
        width: 24px;
        height: 24px;
        margin: 0 auto 0.5rem;
        display: block;
      }
      .startup-card .warning-state {
        border-color: #d97706;
        background-color: #fffbeb;
      }
      .startup-card .warning-state .warning-message {
        color: #d97706;
        font-weight: 600;
        text-align: center;
        padding: 1.25rem;
        background-color: #fef3c7;
        border-radius: 0.75rem;
        margin: 1.5rem 0;
        border: 1px solid #fed7aa;
      }
      .startup-card .warning-state .warning-icon {
        color: #d97706;
        width: 24px;
        height: 24px;
        margin: 0 auto 0.5rem;
        display: block;
      }
      .startup-card .info-state {
        border-color: #3b82f6;
        background-color: #eff6ff;
      }
      .startup-card .info-state .info-message {
        color: #3b82f6;
        font-weight: 600;
        text-align: center;
        padding: 1.25rem;
        background-color: #dbeafe;
        border-radius: 0.75rem;
        margin: 1.5rem 0;
        border: 1px solid #bfdbfe;
      }
      .startup-card .info-state .info-icon {
        color: #3b82f6;
        width: 24px;
        height: 24px;
        margin: 0 auto 0.5rem;
        display: block;
      }
      .startup-card .disabled-state {
        opacity: 0.5;
        pointer-events: none;
        filter: grayscale(100%);
      }
      .startup-card .disabled-state .card-content {
        filter: grayscale(100%);
      }
      .startup-card .disabled-state .card-footer {
        filter: grayscale(100%);
      }
      .startup-card .disabled-state .button-left,
      .startup-card .disabled-state .button-right {
        background-color: #9ca3af;
        cursor: not-allowed;
      }
      .startup-card .selected-state {
        border-color: #3b82f6;
        background-color: #eff6ff;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        border-width: 2px;
      }
      .startup-card .selected-state .selected-indicator {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 24px;
        height: 24px;
        background-color: #3b82f6;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
      }
      .startup-card .drag-over {
        border-color: #3b82f6;
        background-color: #eff6ff;
        transform: scale(1.03);
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.25);
        border-width: 2px;
      }
      .startup-card .dragging {
        opacity: 0.6;
        transform: rotate(3deg) scale(1.05);
        z-index: 1000;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      .startup-card .drop-zone {
        border-style: dashed;
        border-width: 3px;
        border-color: #3b82f6;
        background-color: #eff6ff;
        border-radius: 0.75rem;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
      }
      .startup-card:focus-within {
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
        border-color: #3b82f6;
      }
      .startup-card .focus-ring {
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        border: 3px solid #3b82f6;
        border-radius: 1rem;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
      }
      .startup-card:focus-within .focus-ring {
        opacity: 1;
      }
      .startup-card[tabindex]:focus {
        outline: none;
      }
      .startup-card[tabindex]:focus .focus-ring {
        opacity: 1;
      }
      .startup-card .keyboard-focus {
        outline: 3px solid #3b82f6;
        outline-offset: 3px;
      }
      .startup-card .keyboard-focus:focus {
        outline: 3px solid #3b82f6;
        outline-offset: 3px;
      }
      .startup-card .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      .startup-card .aria-label {
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }
      .startup-card .aria-describedby {
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }
      .startup-card .aria-hidden {
        display: none;
      }
      .startup-card .aria-expanded {
        display: block;
      }
      @media (prefers-contrast: high) {
        .startup-card {
          border-width: 3px;
          border-color: #000;
          background-color: white;
        }
        .startup-card .button-left,
        .startup-card .button-right {
          border: 3px solid #000;
        }
        .startup-card .sector-tag {
          border: 2px solid #000;
        }
        .startup-card .focus-ring {
          border-width: 3px;
          border-color: #000;
        }
        .startup-card .info-row {
          border: 2px solid #000;
        }
        .startup-card .sectors-container {
          border: 2px solid #000;
        }
        .startup-card .description-wrapper {
          border: 2px solid #000;
        }
      }
      @media print {
        .startup-card {
          break-inside: avoid;
          page-break-inside: avoid;
          box-shadow: none;
          border: 2px solid #000;
          background-color: white;
          color: black;
        }
        .startup-card .card-footer {
          display: none;
        }
        .startup-card .focus-ring {
          display: none;
        }
        .startup-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .startup-card {
          animation: none;
          transition: none;
        }
        .startup-card:hover {
          transform: none;
        }
        .startup-card .button-left:hover,
        .startup-card .button-right:hover {
          transform: none;
        }
        .startup-card .focus-ring {
          transition: none;
        }
        .startup-card .sector-tag:hover {
          transform: none;
        }
        .startup-card .info-item:hover {
          transform: none;
        }
      }
      .startup-card .focus-visible {
        outline: 3px solid #3b82f6;
        outline-offset: 3px;
      }
      .startup-card .focus-visible:not(:focus-visible) {
        outline: none;
      }
      .startup-card .focus-visible:focus-visible {
        outline: 3px solid #3b82f6;
        outline-offset: 3px;
      }
      .startup-card .focus-visible:focus {
        outline: 3px solid #3b82f6;
        outline-offset: 3px;
      }
      .startup-card .flex-wrap {
        flex-wrap: wrap;
        align-items: flex-start;
      }
      .startup-card .gap-2 {
        gap: 0.75rem;
      }
      .startup-card .sectors-wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        align-items: flex-start;
        justify-content: flex-start;
        padding: 0.5rem;
        background-color: #f8fafc;
        border-radius: 0.5rem;
        border: 1px solid #e2e8f0;
      }
      .startup-card .rounded-full {
        border-radius: 9999px;
      }
      .startup-card .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .startup-card .description-text {
        line-height: 1.6;
        color: #374151;
        font-weight: 500;
      }
      .startup-card .description-wrapper {
        background-color: #f9fafb;
        border-radius: 0.75rem;
        padding: 1.25rem;
        border: 1px solid #e5e7eb;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
      }
      .startup-card .break-words {
        word-break: break-word;
      }
      .startup-card .leading-relaxed {
        line-height: 1.625;
      }
      .startup-card .card-footer button,
      .startup-card .card-footer a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        border-radius: 0.5rem;
        transition: all 0.2s ease-in-out;
        text-decoration: none;
        border: none;
        cursor: pointer;
      }
      .startup-card .card-footer button:hover,
      .startup-card .card-footer a:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      .startup-card .card-content svg,
      .startup-card .card-content .w-4 {
        width: 1rem;
        height: 1rem;
        flex-shrink: 0;
      }
      .startup-card .card-content .space-x-2 > * + * {
        margin-left: 0.5rem;
      }
      .startup-card .card-content .space-x-3 > * + * {
        margin-left: 0.75rem;
      }
      .startup-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 2rem;
        align-items: start;
        padding: 1rem;
      }
      @media (min-width: 640px) {
        .startup-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 1.75rem;
        }
      }
      @media (min-width: 1280px) {
        .startup-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
      }
      .startup-card {
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1), 0 1px 3px 0 rgba(0, 0, 0, 0.06);
        border: 1px solid #e5e7eb;
        transition: all 0.2s ease-in-out;
        padding: 1.5rem;
      }
      .startup-card:hover {
        box-shadow: 0 12px 20px -3px rgba(0, 0, 0, 0.15), 0 6px 8px -2px rgba(0, 0, 0, 0.08);
        transform: translateY(-3px);
        border-color: #d1d5db;
      }
      .startup-card h3 {
        font-size: 1.25rem;
        line-height: 1.75rem;
        font-weight: 700;
        color: #111827;
        margin: 0;
        padding: 0;
        margin-bottom: 0.5rem;
      }
      .startup-card p {
        margin: 0;
        padding: 0;
        color: #374151;
        font-size: 0.875rem;
        line-height: 1.25rem;
      }
      .startup-card .bg-blue-100 { background-color: #dbeafe; color: #1e40af; }
      .startup-card .bg-green-100 { background-color: #dcfce7; color: #166534; }
      .startup-card .bg-purple-100 { background-color: #e9d5ff; color: #7c3aed; }
      .startup-card .bg-orange-100 { background-color: #fed7aa; color: #ea580c; }
      .startup-card .bg-pink-100 { background-color: #fce7f3; color: #be185d; }
      .startup-card .bg-indigo-100 { background-color: #e0e7ff; color: #3730a3; }
      .startup-card .bg-teal-100 { background-color: #ccfbf1; color: #0f766e; }
      .startup-card .bg-yellow-100 { background-color: #fef3c7; color: #a16207; }
      .startup-card .bg-green-600 { background-color: #059669; }
      .startup-card .bg-green-600:hover { background-color: #047857; }
      .startup-card .bg-red-600 { background-color: #dc2626; }
      .startup-card .bg-red-600:hover { background-color: #b91c1c; }
      .startup-card .text-white { color: #ffffff; }
      .startup-card .font-medium { font-weight: 500; }
      .startup-card .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
      .startup-card .text-blue-500 { color: #3b82f6; }
      .startup-card .text-green-500 { color: #10b981; }
      .startup-card .text-purple-500 { color: #8b5cf6; }
      .startup-card .text-gray-800 { color: #1f2937; }
      .startup-card .text-gray-700 { color: #374151; }
      .startup-card .font-semibold { font-weight: 600; }
      .startup-card .mb-3 { margin-bottom: 0.75rem; }
      .startup-card .mb-4 { margin-bottom: 1rem; }
      .startup-card .pt-4 { padding-top: 1rem; }
      .startup-card .p-3 { padding: 0.75rem; }
      .startup-card .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
      .startup-card .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
      .startup-card .py-1.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
      .startup-card .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
      .startup-card .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
      .startup-card .border-t { border-top-width: 1px; }
      .startup-card .border-gray-100 { border-color: #f3f4f6; }
      .startup-card .rounded-lg { border-radius: 0.5rem; }
      .startup-card .rounded-full { border-radius: 9999px; }
      .startup-card .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
      .startup-card .flex { display: flex; }
      .startup-card .flex-col { flex-direction: column; }
      .startup-card .flex-wrap { flex-wrap: wrap; }
      .startup-card .items-center { align-items: center; }
      .startup-card .items-start { align-items: flex-start; }
      .startup-card .justify-center { justify-content: center; }
      .startup-card .justify-between { justify-content: space-between; }
      .startup-card .w-full { width: 100%; }
      .startup-card .h-full { height: 100%; }
      .startup-card .transition-all { transition-property: all; }
      .startup-card .duration-200 { transition-duration: 200ms; }
      .startup-card .ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
      .startup-card .hover\\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
      .startup-card .hover\\:bg-green-700:hover { background-color: #047857; }
      .startup-card .hover\\:bg-red-700:hover { background-color: #b91c1c; }
      .startup-card .text-xs { font-size: 0.75rem; line-height: 1rem; }
      .startup-card .text-base { font-size: 1rem; line-height: 1.5rem; }
      .startup-card .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
      .startup-card .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
      .startup-card .text-2xl { font-size: 1.5rem; line-height: 2rem; }
      @media (max-width: 640px) {
        .startup-card h3 { font-size: 1rem; line-height: 1.5rem; }
        .startup-card .h-16 { height: 3rem; }
        .startup-card .h-20 { height: 4rem; }
        .startup-card .h-24 { height: 5rem; }
        .startup-card .h-10 { height: 2rem; }
      }
      @media (min-width: 641px) and (max-width: 1024px) {
        .startup-card h3 { font-size: 1.125rem; line-height: 1.75rem; }
      }
      .startup-grid {
        grid-auto-rows: 1fr;
        grid-auto-flow: row;
        grid-template-rows: repeat(auto-fill, minmax(450px, 1fr));
      }
      .startup-card {
        grid-row: span 1;
        grid-column: span 1;
      }
      .startup-card .card-footer .flex {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }
      .startup-card .card-footer button,
      .startup-card .card-footer a {
        flex: 1;
        margin: 0;
        min-height: 2.5rem;
      }
      .startup-card .card-footer .gap-3 {
        gap: 0.75rem;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [startups, setStartups] = useState<FintechStartup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [showUploadGuide, setShowUploadGuide] = useState(false);
  const [pendingStartups, setPendingStartups] = useState<any[]>([]);
  const [loadingPendingStartups, setLoadingPendingStartups] = useState(false);
  const [verificationNotification, setVerificationNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pendingDisplayCount, setPendingDisplayCount] = useState(3);

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [displayCount, setDisplayCount] = useState(6);

  // Fetch startups from backend on mount and when filters change
  useEffect(() => {
    const fetchStartups = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const res = await fetch(`${apiUrl}/startups`);
        if (!res.ok) throw new Error('Failed to fetch startups');
        const data = await res.json();
        setStartups(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch startups');
        console.error('Error fetching startups:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, []);

  // Fetch pending startups for admin verification
  useEffect(() => {
    if (currentUser?.role === 'admin' && currentUser.token) {
      setLoadingPendingStartups(true);
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      fetch(`${apiUrl}/startups/pending`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      })
        .then(res => res.json())
        .then(data => {
          setPendingStartups(data.startups || []);
          setLoadingPendingStartups(false);
        })
        .catch(() => setLoadingPendingStartups(false));
    }
  }, [currentUser]);
  
  const [newStartup, setNewStartup] = useState({
    name: '',
    country: '',
    sector: '',
    foundedYear: new Date().getFullYear(),
    description: '',
    website: ''
  });

  // Helper function to parse sectors (handle both single and multiple sectors)
  const parseSectors = (sectorData: string | string[]): string[] => {
    if (Array.isArray(sectorData)) {
      return sectorData;
    }
    if (typeof sectorData === 'string') {
      // Handle comma-separated sectors, semicolon-separated, or single sector
      return sectorData.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0);
    }
    return [];
  };

  // Get all unique sectors from all startups for filtering
  const allSectors = React.useMemo(() => {
    const sectorSet = new Set<string>();
    startups.forEach(startup => {
      const sectors = parseSectors(startup.sector);
      sectors.forEach(sector => sectorSet.add(sector));
    });
    return Array.from(sectorSet).sort();
  }, [startups]);

  // Update sectors array to use dynamic sectors from data
  const sectors = allSectors;

  // Replace with a full list of African countries
  const countries = [
    'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroon', 'Central African Republic',
    'Chad', 'Comoros', 'Congo', 'Democratic Republic of the Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea',
    'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho',
    'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia',
    'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa',
    'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'
  ];

  // Add startup handler
  const handleAddStartup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Please sign in to add startups');
      return;
    }

    const startup: FintechStartup = {
      id: Date.now().toString(),
      ...newStartup,
      addedBy: currentUser.name || currentUser.email,
      addedAt: Date.now()
    };

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      
      // Include auth token if available (for admin auto-approval)
      if (currentUser.token) {
        headers['Authorization'] = `Bearer ${currentUser.token}`;
      }
      
      const res = await fetch(`${apiUrl}/startups`, {
        method: 'POST',
        headers,
        body: JSON.stringify(startup),
      });
      if (!res.ok) throw new Error('Failed to add startup');
      const newStartup = await res.json();
      setStartups(prev => [newStartup, ...prev]); // Show new startup immediately
    } catch {
      setError('Failed to add startup');
    }
    setNewStartup({
      name: '',
      country: '',
      sector: '',
      foundedYear: new Date().getFullYear(),
      description: '',
      website: ''
    });
    setShowAddForm(false);
  };

  // Delete startup handler
  const handleDeleteStartup = async (startupId: string) => {
    if (!currentUser?.token) {
      alert('Please sign in to delete startups');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this startup? This action cannot be undone and will permanently remove it from the database.')) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${apiUrl}/startups/${startupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete startup');
      }

      const result = await res.json();
      
      // Remove the deleted startup from the local state
      setStartups(prev => prev.filter(s => s.id !== startupId));
      
      // Show success notification
      setVerificationNotification({
        type: 'success',
        message: `Startup "${result.deletedStartup.name}" deleted successfully!`
      });

      // Clear notification after 5 seconds
      setTimeout(() => {
        setVerificationNotification(null);
      }, 5000);

      console.log('✅ Startup deleted:', result);
    } catch (error) {
      console.error('❌ Error deleting startup:', error);
      setVerificationNotification({
        type: 'error',
        message: `Failed to delete startup: ${error instanceof Error ? error.message : 'Unknown error'}`
      });

      // Clear error notification after 5 seconds
      setTimeout(() => {
        setVerificationNotification(null);
      }, 5000);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
      setUploadStatus('❌ Invalid file format! Please upload only Excel (.xlsx, .xls) or CSV files.');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('❌ File too large! Maximum size is 10MB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        // Validate required fields
        const requiredFields = ['Organization Name', 'Headquarters Location', 'Industries', 'Founded Date'];
        const missingFields = requiredFields.filter(field => !Object.keys(json[0] || {}).some(col => 
          col.toLowerCase().includes(field.toLowerCase().replace(/\s+/g, '')) ||
          col.toLowerCase().includes(field.toLowerCase().split(' ')[0])
        ));
        
        if (missingFields.length > 0) {
          setUploadStatus(`❌ Missing required fields: ${missingFields.join(', ')}. Please check the upload guide for required column names.`);
          return;
        }
        
        // POST to backend
        setUploadStatus('Uploading...');
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        
        const requestBody = { data: json };
        
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        
        // Include auth token if available (for admin auto-approval)
        if (currentUser?.token) {
          headers['Authorization'] = `Bearer ${currentUser.token}`;
        }
        
        const res = await fetch(`${apiUrl}/startups/bulk`, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error('Backend error response:', errorData);
          throw new Error(errorData.error || 'Bulk upload failed');
        }
        
        const result = await res.json();
        setUploadStatus(`✅ ${result.message}`);
        // Refresh startups list
        fetch(`${apiUrl}/startups`)
          .then(res => res.json())
          .then(data => setStartups(data));
      } catch (err) {
        console.error('Bulk upload error:', err);
        setUploadStatus(`❌ Bulk upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle individual startup verification
  const handleVerifyStartup = async (startupId: string, status: 'approved' | 'rejected', notes?: string) => {
    if (!currentUser?.token) return;
    
    const action = status === 'approved' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${action} this startup?`)) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/startups/${startupId}/verify`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}` 
        },
        body: JSON.stringify({ 
          verificationStatus: status,
          adminNotes: notes || ''
        }),
      });
      
      if (response.ok) {
        // Remove from pending list
        setPendingStartups(prev => prev.filter(s => s._id !== startupId));
        setVerificationNotification({ 
          type: 'success', 
          message: `Startup ${status} successfully.` 
        });
        
        // Refresh verified startups list
        const res = await fetch(`${apiUrl}/startups`);
        if (res.ok) {
          const data = await res.json();
          setStartups(data);
        }
      } else {
        throw new Error('Failed to verify startup');
      }
    } catch (error) {
      setVerificationNotification({ 
        type: 'error', 
        message: 'Failed to verify startup.' 
      });
    }
  };

  // Handle bulk verification of all pending startups
  const handleVerifyAllStartups = async () => {
    if (!currentUser?.token || pendingStartups.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to approve all ${pendingStartups.length} pending startups?`)) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/startups/bulk-verify`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}` 
        },
        body: JSON.stringify({ 
          startupIds: pendingStartups.map(s => s._id),
          verificationStatus: 'approved',
          adminNotes: 'Bulk approved by admin'
        }),
      });
      
      if (response.ok) {
        // Clear pending list
        setPendingStartups([]);
        setVerificationNotification({ 
          type: 'success', 
          message: `All ${pendingStartups.length} startups approved successfully.` 
        });
        
        // Refresh verified startups list
        const res = await fetch(`${apiUrl}/startups`);
        if (res.ok) {
          const data = await res.json();
          setStartups(data);
        }
      } else {
        throw new Error('Failed to bulk verify startups');
      }
    } catch (error) {
      setVerificationNotification({ 
        type: 'error', 
        message: 'Failed to bulk verify startups.' 
      });
    }
  };

  // Handle showing more pending startups
  const handleShowMorePending = () => {
    setPendingDisplayCount(prev => prev + 3);
  };

  // Reset pending display count when pending startups change
  useEffect(() => {
    setPendingDisplayCount(3);
  }, [pendingStartups.length]);

  // Apply filters and search
  const filteredStartups = React.useMemo(() => {
    const filtered = startups.filter(startup => {
      // Search term filter (name, description, website)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        startup.name.toLowerCase().includes(searchLower) ||
        (startup.description && startup.description.toLowerCase().includes(searchLower)) ||
        (startup.website && startup.website.toLowerCase().includes(searchLower));

      // Country filter
      const matchesCountry = !selectedCountry || startup.country === selectedCountry;

      // Sector filter (check if any sector matches)
      const matchesSector = !selectedSector || 
        parseSectors(startup.sector).some(sector => 
          sector.toLowerCase().includes(selectedSector.toLowerCase())
        );

      return matchesSearch && matchesCountry && matchesSector;
    });

    // Sort by founded year in descending order (latest first)
    return filtered.sort((a, b) => {
      const yearA = parseInt(String(a.foundedYear)) || 0;
      const yearB = parseInt(String(b.foundedYear)) || 0;
      return yearB - yearA; // Descending order (newest first)
    });
  }, [startups, searchTerm, selectedCountry, selectedSector]);

  // Show startups in batches of 6
  const displayedStartups = filteredStartups.slice(0, displayCount);
  const hasMoreStartups = filteredStartups.length > displayCount;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-3 md:p-4 lg:p-6 w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">Fintech Startups</h2>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {filteredStartups.length} of {startups.length} startups across Africa
              {(searchTerm || selectedCountry || selectedSector) && (
                <span className="text-blue-600 font-medium">
                  {' '}(filtered)
                </span>
              )}
            </p>
          </div>
        </div>

        {(currentUser && (currentUser.role === 'admin' || currentUser.role === 'editor' || currentUser.role === 'viewer')) && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Add Startup</span>
            </button>
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm">
                <span>Bulk Upload (.xlsx, .csv)</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  style={{ display: 'none' }}
                  onChange={handleBulkUpload}
                />
              </label>
              <button
                onClick={() => setShowUploadGuide(true)}
                className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                title="View upload requirements"
              >
                <span>📋 Guide</span>
              </button>
            </div>
          </div>
        )}

        {/* Startup Verification Panel - Admin Only */}
        {currentUser?.role === 'admin' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-orange-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-orange-900">Startup Verification</h3>
              </div>
              {pendingStartups.length > 0 && (
                <button
                  onClick={handleVerifyAllStartups}
                  className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs font-medium"
                >
                  ✅ Verify All ({pendingStartups.length})
                </button>
              )}
            </div>

            {verificationNotification && (
              <div className={`mb-3 p-2 rounded text-xs ${verificationNotification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {verificationNotification.message}
              </div>
            )}

            {loadingPendingStartups ? (
              <p className="text-orange-600 text-sm">Loading pending startups...</p>
            ) : pendingStartups.length === 0 ? (
              <p className="text-orange-600 text-sm">No startups pending verification.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-orange-700">
                  <span className="font-semibold">{pendingStartups.length}</span> startup(s) awaiting verification
                  {pendingStartups.length > 3 && (
                    <span className="ml-2 text-orange-600">
                      (Showing {Math.min(pendingDisplayCount, pendingStartups.length)} of {pendingStartups.length})
                    </span>
                  )}
                </p>
                {pendingStartups.slice(0, pendingDisplayCount).map(startup => (
                  <div key={startup._id} className="border border-orange-200 rounded p-2 bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{startup.name}</h4>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>📍 {startup.country}</p>
                          <p>🏢 {startup.sector}</p>
                          <p>📅 Founded: {startup.foundedYear}</p>
                          <p>📤 Added: {new Date(startup.addedAt).toLocaleDateString()}</p>
                          {startup.addedBy && <p>👤 By: {startup.addedBy}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerifyStartup(startup._id, 'approved')}
                          className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => {
                            const notes = prompt('Rejection reason (optional):');
                            handleVerifyStartup(startup._id, 'rejected', notes || '');
                          }}
                          className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium"
                        >
                          ❌ Reject
                        </button>
                        <button
                          onClick={() => handleDeleteStartup(startup._id)}
                          className="px-2 py-1 bg-red-800 text-white rounded hover:bg-red-900 text-xs font-medium"
                          title="Delete this startup permanently"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Pagination Controls */}
                <div className="flex gap-2 justify-center">
                  {pendingStartups.length > pendingDisplayCount && (
                    <button
                      onClick={handleShowMorePending}
                      className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs font-medium"
                    >
                      Show More ({pendingStartups.length - pendingDisplayCount} more)
                    </button>
                  )}
                  {pendingDisplayCount > 3 && (
                    <button
                      onClick={() => setPendingDisplayCount(3)}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs font-medium"
                    >
                      Show Less
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {uploadStatus && (
        <div className={`mb-3 sm:mb-4 p-2 sm:p-3 rounded text-xs sm:text-sm ${uploadStatus.startsWith('✅') || uploadStatus.startsWith('❌') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {uploadStatus}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        {/* Active Filters Display */}
        {(searchTerm || selectedCountry || selectedSector) && (
          <div className="col-span-full flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs text-gray-600 font-medium">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {selectedCountry && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Country: {selectedCountry}
                <button
                  onClick={() => setSelectedCountry('')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {selectedSector && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                Sector: {selectedSector}
                <button
                  onClick={() => setSelectedSector('')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCountry('');
                setSelectedSector('');
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all filters
            </button>
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search startups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white placeholder-gray-400"
          />
        </div>

        <div className="relative">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white appearance-none cursor-pointer"
          >
            <option value="">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="relative">
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white appearance-none cursor-pointer"
          >
            <option value="">All Sectors</option>
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Add Startup Form */}
      {showAddForm && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 md:p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Add New Fintech Startup</h3>
          <form onSubmit={handleAddStartup} className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            <div className="sm:col-span-1">
              <input
                type="text"
                placeholder="Startup Name"
                value={newStartup.name}
                onChange={(e) => setNewStartup({ ...newStartup, name: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white placeholder-gray-400"
                required
              />
            </div>

            <div className="sm:col-span-1">
              <select
                value={newStartup.country}
                onChange={(e) => setNewStartup({ ...newStartup, country: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
                required
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1">
              <input
                type="text"
                placeholder="Sectors (e.g., Payments, Mobile Money, Lending)"
                value={newStartup.sector}
                onChange={(e) => setNewStartup({ ...newStartup, sector: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white placeholder-gray-400"
                required
              />
              <p className="text-xs text-gray-500 mt-1">💡 Separate multiple sectors with commas (e.g., "Payments, Mobile Money, Lending")</p>
            </div>

            <div className="sm:col-span-1">
              <input
                type="number"
                placeholder="Founded Year"
                value={newStartup.foundedYear}
                onChange={(e) => setNewStartup({ ...newStartup, foundedYear: parseInt(e.target.value) })}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white placeholder-gray-400"
                min="1990"
                max={new Date().getFullYear()}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <input
                type="url"
                placeholder="Website (optional)"
                value={newStartup.website}
                onChange={(e) => setNewStartup({ ...newStartup, website: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white placeholder-gray-400"
              />
            </div>

            <div className="sm:col-span-2">
              <textarea
                placeholder="Description"
                value={newStartup.description}
                onChange={(e) => setNewStartup({ ...newStartup, description: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white placeholder-gray-400"
                rows={3}
                required
              />
            </div>

            <div className="sm:col-span-2 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="submit"
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Add Startup
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Startups Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading startups...</p>
        </div>
      ) : error ? (
        <div className="text-red-600 text-sm p-4 text-center">{error}</div>
      ) : (
        <>
          {filteredStartups.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No startups found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCountry || selectedSector 
                  ? 'Try adjusting your search terms or filters.'
                  : 'No startups are currently available.'
                }
              </p>
              {(searchTerm || selectedCountry || selectedSector) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCountry('');
                    setSelectedSector('');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="startup-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8 w-full max-w-full min-w-0 overflow-hidden items-stretch">
              {displayedStartups.map((startup, index) => (
                <div key={startup.id || `startup-${index}-${startup.name}`} className="startup-card border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-lg transition-all duration-200 w-full max-w-full min-w-0 overflow-hidden bg-white flex flex-col h-full justify-between">
                  {/* Header Section - Fixed height for consistency */}
                  <div className="card-content flex-1 min-h-0">
                    {/* Startup Name - Fixed height for perfect alignment */}
                    <div className="h-16 mb-3 flex items-start">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-words leading-tight">{startup.name}</h3>
                    </div>
                    
                    {/* Sectors - Increased height for better spacing */}
                    <div className="h-20 flex flex-wrap gap-2 mb-6 items-start">
                      {(() => {
                        const sectors = parseSectors(startup.sector);
                        

                        
                        // Color palette for different sectors
                        const sectorColors = [
                          'bg-blue-100 text-blue-800',
                          'bg-green-100 text-green-800', 
                          'bg-purple-100 text-purple-800',
                          'bg-orange-100 text-orange-800',
                          'bg-pink-100 text-pink-800',
                          'bg-indigo-100 text-indigo-800',
                          'bg-teal-100 text-teal-800',
                          'bg-yellow-100 text-yellow-800'
                        ];
                        
                        // If no sectors, show a placeholder
                        if (sectors.length === 0) {
                          return (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex-shrink-0 font-medium">
                              No Sector
                            </span>
                          );
                        }
                        
                        return sectors.map((sector, index) => (
                          <span 
                            key={index} 
                            className={`px-3 py-1.5 text-sm rounded-full flex-shrink-0 font-medium shadow-sm ${
                              sectorColors[index % sectorColors.length]
                            }`}
                            title={sector}
                          >
                            {sector}
                          </span>
                        ));
                      })()}
                    </div>
                    
                    {/* Description - Increased height for better spacing */}
                    <div className="h-24 mb-4">
                      <p className="text-sm sm:text-base text-gray-700 line-clamp-3 break-words leading-relaxed font-medium">{startup.description}</p>
                    </div>
                    
                    {/* Info Section - All details on one row for perfect alignment */}
                    <div className="h-16 flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-semibold text-gray-800">{startup.country}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold text-gray-800">{startup.foundedYear}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-semibold text-gray-800">{startup.addedBy || 'Unknown'}</span>
                      </div>
                    </div>
                    
                    {/* Footer Section - Buttons side by side */}
                    <div className="card-footer pt-4 border-t border-gray-100 h-16 flex items-end">
                      <div className="flex gap-3 w-full">
                        {/* Visit Website Button - Left Side */}
                        {startup.website ? (
                          <a
                            href={startup.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center px-3 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors h-10"
                          >
                            <Globe className="w-4 h-4 mr-2" />
                            Visit Website
                          </a>
                        ) : (
                          <div className="flex-1 h-10"></div>
                        )}
                        
                        {/* Delete Button - Right Side */}
                        {(currentUser?.role === 'admin' || currentUser?.role === 'editor') && (
                          <button
                            onClick={() => handleDeleteStartup(startup.id)}
                            className={`px-3 py-3 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 h-10 ${startup.website ? 'flex-1' : 'w-full'}`}
                            title="Delete this startup permanently"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        
        {/* View More Button */}
        {hasMoreStartups && (
          <div className="flex justify-center mt-6 sm:mt-8">
            <button
              onClick={() => setDisplayCount(prev => prev + 6)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base font-medium"
            >
              View More ({Math.min(6, filteredStartups.length - displayCount)} more)
            </button>
          </div>
        )}
        
        {/* Show Less Button */}
        {displayCount > 6 && (
          <div className="flex justify-center mt-6 sm:mt-8">
            <button
              onClick={() => setDisplayCount(6)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base font-medium"
            >
              Show Less
            </button>
          </div>
        )}
        </>
      )}



      {/* Upload Guide Modal */}
      {showUploadGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">📋 Bulk Upload Guide</h3>
                <button
                  onClick={() => setShowUploadGuide(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* File Requirements */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">📁 File Requirements</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p className="text-sm text-gray-700"><strong>Supported formats:</strong> Excel (.xlsx, .xls) or CSV</p>
                    <p className="text-sm text-gray-700"><strong>Maximum size:</strong> 10MB</p>
                    <p className="text-sm text-gray-700"><strong>Sheet:</strong> First sheet will be processed</p>
                  </div>
                </div>

                {/* Required Columns */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">🔴 Required Columns</h4>
                  <div className="bg-red-50 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="font-semibold text-red-800">Organization Name</p>
                        <p className="text-sm text-red-700">Company/startup name</p>
                      </div>
                      <div>
                        <p className="font-semibold text-red-800">Headquarters Location</p>
                        <p className="text-sm text-red-700">City, Country (e.g., "Lagos, Nigeria")</p>
                      </div>
                      <div>
                        <p className="font-semibold text-red-800">Industries</p>
                        <p className="text-sm text-red-700">Sectors separated by commas (e.g., "Payments, Mobile Money, Lending")</p>
                      </div>
                      <div>
                        <p className="font-semibold text-red-800">Founded Date</p>
                        <p className="text-sm text-red-700">Year founded (e.g., 2020)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Columns */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">🟡 Optional Columns</h4>
                  <div className="bg-yellow-50 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="font-semibold text-yellow-800">Description</p>
                        <p className="text-sm text-yellow-700">Company description</p>
                      </div>
                      <div>
                        <p className="font-semibold text-yellow-800">Website</p>
                        <p className="text-sm text-yellow-700">Company website URL</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Example */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">📝 Example Row</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-blue-200">
                            <th className="text-left p-2 text-blue-800">Organization Name</th>
                            <th className="text-left p-2 text-blue-800">Headquarters Location</th>
                            <th className="text-left p-2 text-blue-800">Industries</th>
                            <th className="text-left p-2 text-blue-800">Founded Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-2 text-blue-700">Teletech</td>
                            <td className="p-2 text-blue-700">Congo</td>
                            <td className="p-2 text-blue-700">Payments, Mobile Money, Lending</td>
                            <td className="p-2 text-blue-700">2025</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">💡 Tips</h4>
                  <div className="bg-green-50 p-4 rounded-lg space-y-2">
                    <p className="text-sm text-green-700">• Multiple sectors can be separated by commas or semicolons</p>
                    <p className="text-sm text-green-700">• Only African countries are accepted</p>
                    <p className="text-sm text-green-700">• Founded date should be a year (1900-2024)</p>
                    <p className="text-sm text-green-700">• Column names are case-insensitive</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowUploadGuide(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};