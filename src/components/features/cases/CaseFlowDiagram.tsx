'use client';

import React from 'react';
import { CaseStatus } from '@/types/api';
import { motion } from 'framer-motion';

interface CaseFlowDiagramProps {
  currentStatus: CaseStatus;
}

interface FlowStage {
  status: CaseStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

export default function CaseFlowDiagram({ currentStatus }: CaseFlowDiagramProps) {
  const flowStages: FlowStage[] = [
    {
      status: 'Open',
      label: 'Case Opened',
      description: 'Initial case submission',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-400',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      status: 'Under Review',
      label: 'Under Review',
      description: 'Case is being reviewed',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-400',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      status: 'Investigation',
      label: 'Investigation',
      description: 'Evidence gathering',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-400',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      status: 'Legal Action',
      label: 'Legal Action',
      description: 'Legal proceedings initiated',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-400',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
    },
    {
      status: 'Mediation',
      label: 'Mediation',
      description: 'Alternative dispute resolution',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-400',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      status: 'Resolved',
      label: 'Resolved',
      description: 'Case successfully resolved',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-400',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      status: 'Closed',
      label: 'Case Closed',
      description: 'Case archived',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-400',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
  ];

  // Find current stage index
  const currentIndex = flowStages.findIndex((stage) => stage.status === currentStatus);
  const isCompleted = (index: number) => index < currentIndex;
  const isCurrent = (index: number) => index === currentIndex;
  const isPending = (index: number) => index > currentIndex;

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Case Handling Flow
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Typical progression of a case from submission to resolution
        </p>
      </div>

      {/* Desktop Flow - Horizontal */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-0 right-0 top-12 h-1 bg-gray-200 dark:bg-gray-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: currentIndex >= 0 ? `${(currentIndex / (flowStages.length - 1)) * 100}%` : '0%',
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
            />
          </div>

          {/* Stages */}
          <div className="relative flex justify-between">
            {flowStages.map((stage, index) => (
              <motion.div
                key={stage.status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
                style={{ width: `${100 / flowStages.length}%` }}
              >
                {/* Stage Icon Circle */}
                <div
                  className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white shadow-lg transition-all duration-300 dark:border-gray-900 ${
                    isCurrent(index)
                      ? `${stage.bgColor} ${stage.color} scale-110 ring-4 ring-offset-2 ${stage.borderColor.replace('border-', 'ring-')}`
                      : isCompleted(index)
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                  }`}
                >
                  {isCompleted(index) ? (
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stage.icon
                  )}
                </div>

                {/* Stage Info */}
                <div className="mt-4 text-center">
                  <h4
                    className={`text-sm font-bold ${
                      isCurrent(index)
                        ? stage.color
                        : isCompleted(index)
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {stage.label}
                  </h4>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    {stage.description}
                  </p>
                  {isCurrent(index) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2"
                    >
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500"></span>
                        </span>
                        Current Stage
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Flow - Vertical */}
      <div className="lg:hidden">
        <div className="relative space-y-6">
          {/* Vertical Progress Line */}
          <div className="absolute left-12 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-700">
            <motion.div
              initial={{ height: 0 }}
              animate={{
                height: currentIndex >= 0 ? `${(currentIndex / (flowStages.length - 1)) * 100}%` : '0%',
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="w-full bg-gradient-to-b from-blue-500 via-purple-500 to-green-500"
            />
          </div>

          {/* Stages */}
          {flowStages.map((stage, index) => (
            <motion.div
              key={stage.status}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start gap-4 pl-28"
            >
              {/* Stage Icon Circle */}
              <div
                className={`absolute left-0 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white shadow-lg transition-all duration-300 dark:border-gray-900 ${
                  isCurrent(index)
                    ? `${stage.bgColor} ${stage.color} scale-110 ring-4 ring-offset-2 ${stage.borderColor.replace('border-', 'ring-')}`
                    : isCompleted(index)
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                }`}
              >
                {isCompleted(index) ? (
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stage.icon
                )}
              </div>

              {/* Stage Info */}
              <div className="flex-1">
                <h4
                  className={`text-base font-bold ${
                    isCurrent(index)
                      ? stage.color
                      : isCompleted(index)
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {stage.label}
                </h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                  {stage.description}
                </p>
                {isCurrent(index) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2"
                  >
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500"></span>
                      </span>
                      Current Stage
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-green-100 ring-2 ring-green-500 dark:bg-green-900/20"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-brand-100 ring-2 ring-brand-500 dark:bg-brand-900/30"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-gray-100 ring-2 ring-gray-300 dark:bg-gray-800"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Pending</span>
        </div>
      </div>
    </div>
  );
}
