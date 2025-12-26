"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Dropdown } from "../../ui/dropdown/Dropdown";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
    setNotifying(false);
  };
  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            !notifying ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notification
          </h5>
          <button
            onClick={toggleDropdown}
            className="text-gray-500 transition dropdown-toggle dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {/* New Incident Reported */}
          <li>
            <Link
              href="/incidents"
              onClick={closeDropdown}
              className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </span>
              <span className="block">
                <span className="mb-1.5 block text-theme-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">New incident reported</span> in Arusha Region
                </span>
                <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                  <span>Pending verification</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>5 min ago</span>
                </span>
              </span>
            </Link>
          </li>

          {/* File Upload Job Completed */}
          <li>
            <Link
              href="/jobs/uploads"
              onClick={closeDropdown}
              className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </span>
              <span className="block">
                <span className="mb-1.5 block text-theme-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">File upload completed</span> - 250 beneficiary records imported
                </span>
                <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                  <span>Jobs</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>12 min ago</span>
                </span>
              </span>
            </Link>
          </li>

          {/* Incident Verified */}
          <li>
            <Link
              href="/incidents"
              onClick={closeDropdown}
              className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </span>
              <span className="block">
                <span className="mb-1.5 block text-theme-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Incident verified</span> - 82% credibility score
                </span>
                <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                  <span>Land dispute case</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>25 min ago</span>
                </span>
              </span>
            </Link>
          </li>

          {/* New Case Assigned */}
          <li>
            <Link
              href="/cases"
              onClick={closeDropdown}
              className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1.323l-3.954 1.582a1 1 0 00-.621.859V8a1 1 0 001 1h7.954a1 1 0 00.621-.859V5.765a1 1 0 00-.621-.859L11 3.323V3a1 1 0 00-1-1zm-4 8v5a1 1 0 001 1h1v-1a1 1 0 112 0v1h1a1 1 0 001-1v-5H6z" clipRule="evenodd"/>
                </svg>
              </span>
              <span className="block">
                <span className="mb-1.5 block text-theme-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">New case assigned</span> to your team
                </span>
                <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                  <span>Land dispute</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>1 hour ago</span>
                </span>
              </span>
            </Link>
          </li>

          {/* Case Status Updated */}
          <li>
            <Link
              href="/cases"
              onClick={closeDropdown}
              className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                </svg>
              </span>
              <span className="block">
                <span className="mb-1.5 block text-theme-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Case #2024-156</span> moved to In Progress
                </span>
                <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                  <span>Property rights</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>2 hours ago</span>
                </span>
              </span>
            </Link>
          </li>

          {/* Message Job Completed */}
          <li>
            <Link
              href="/jobs/messages"
              onClick={closeDropdown}
              className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
              </span>
              <span className="block">
                <span className="mb-1.5 block text-theme-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">SMS broadcast completed</span> - 1,850 beneficiaries notified
                </span>
                <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                  <span>Activity reminder</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>3 hours ago</span>
                </span>
              </span>
            </Link>
          </li>

          {/* Beneficiary Pending Approval */}
          <li>
            <Link
              href="/beneficiaries"
              onClick={closeDropdown}
              className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-50 dark:bg-yellow-900/20">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
              </span>
              <span className="block">
                <span className="mb-1.5 block text-theme-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">15 beneficiary registrations</span> awaiting approval
                </span>
                <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                  <span>Requires review</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>5 hours ago</span>
                </span>
              </span>
            </Link>
          </li>

          {/* Project Milestone */}
          <li>
            <Link
              href="/projects"
              onClick={closeDropdown}
              className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z"/>
                </svg>
              </span>
              <span className="block">
                <span className="mb-1.5 block text-theme-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Community Land Titling Project</span> reached 75% completion
                </span>
                <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                  <span>Milestone achieved</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>1 day ago</span>
                </span>
              </span>
            </Link>
          </li>

          {/* Activity Scheduled */}
          <li>
            <Link
              href="/activities"
              onClick={closeDropdown}
              className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-900/20">
                <svg className="w-5 h-5 text-pink-600 dark:text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
              </span>
              <span className="block">
                <span className="mb-1.5 block text-theme-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Land rights workshop</span> scheduled for tomorrow
                </span>
                <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                  <span>Dar es Salaam</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>2 days ago</span>
                </span>
              </span>
            </Link>
          </li>
        </ul>
        <Link
          href="/notifications"
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          View All Notifications
        </Link>
      </Dropdown>
    </div>
  );
}
