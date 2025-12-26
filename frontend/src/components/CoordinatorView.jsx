import { useState, useEffect } from 'react'
import axios from 'axios'
import './CoordinatorView.css'

const API_URL = import.meta.env.VITE_API_URL

function CoordinatorView({ user, onLogout, currentStop }) {
  const [bars, setBars] = useState([])
  const [groupsWaiting, setGroupsWaiting] = useState([])
  const [groupsInside, setGroupsInside] = useState([])
  const [groupsNotInside, setGroupsNotInside] = useState([])
  const [draggedGroup, setDraggedGroup] = useState(null)
  const [draggedFrom, setDraggedFrom] = useState(null)

  const [waitingGroups, setWaitingGroups] = useState([])
  const [currentGroups, setCurrentGroups] = useState([])
  const [transitGroups, setTransitGroups] = useState([])

  useEffect(() => {
    
    // Only load group data if we have a current stop
    if (currentStop) {
      loadGroupData()
      
      // Refresh every 5 seconds
      const interval = setInterval(() => {
        loadGroupData()
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [currentStop])

  // const loadBars = () => {
  //   const allBars = getBars()
  //   setBars(allBars)
    
  //   // Only set current bar from localStorage on initial load
  //   if (isInitialLoad) {
  //     setIsInitialLoad(false)
  //     const savedUser = localStorage.getItem('bar_crawl_user')
  //     if (savedUser) {
  //       try {
  //         const userData = JSON.parse(savedUser)
  //         if (userData.currentBarId) {
  //           const bar = allBars.find(b => b.id === userData.currentBarId)
  //           if (bar) {
  //             setCurrentBar(bar)
  //           }
  //         }
  //       } catch (e) {
  //         // Ignore parse errors
  //       }
  //     }
  //   }
  // }

  const loadGroupData = () => {
    // Fetch data on group locations
    if (!currentStop) return

    axios({
      method: 'get',
      url: `${API_URL}/stop/${currentStop._id}`,
    }).then(res => {
      setWaitingGroups(res.waitingGroups)
      setCurrentGroups(res.currentGroups)
      setTransitGroups(res.transitGroups)
    }).catch(err => {
      // TODO: Error handling
      console.error(err)
    })

  }

  const handleDragStart = (e, group, from) => {
    setDraggedGroup(group)
    setDraggedFrom(from)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, target) => {
    e.preventDefault()
    if (!draggedGroup || !draggedFrom || draggedFrom === target) {
      setDraggedGroup(null)
      setDraggedFrom(null)
      return
    }

    // Import functions dynamically to avoid circular dependencies
    const {
      addGroupToWaitingList,
      removeGroupFromWaitingList,
      leaveBar,
      hasWaitingGroups,
      getGroupVisitedBars
    } = await import('../services/barCrawlService')

    // Check if group has already visited this bar (for waiting and inside targets)
    // Allow if the group is currently inside (draggedFrom === 'inside') - they're just staying
    // For 'notInside' to 'inside', check if they've visited - only allow if they haven't visited
    if (target === 'waiting' || target === 'inside') {
      // Skip check if group is already inside (they're just staying)
      if (draggedFrom !== 'inside') {
        const visitedBars = getGroupVisitedBars(draggedGroup)
        if (visitedBars.includes(currrentStop.id)) {
          alert(`Group ${draggedGroup} has already visited ${currrentStop.name}. Groups cannot revisit the same bar.`)
          setDraggedGroup(null)
          setDraggedFrom(null)
          return
        }
      }
    }

  //   if (target === 'waiting') {
  //     // Move to waiting list
  //     if (draggedFrom === 'inside') {
  //       // Remove all attendees in this group from the bar
  //       const attendees = getAllAttendeeLocations()
  //       attendees.forEach(attendee => {
  //         if (attendee.currentBarId === currrentStop.id && attendee.group === draggedGroup) {
  //           leaveBar(attendee.userId)
  //         }
  //       })
  //     }
  //     // Add to waiting list (if not already there)
  //     if (!groupsWaiting.includes(draggedGroup)) {
  //       addGroupToWaitingList(currrentStop.id, draggedGroup)
  //     }
  //   } else if (target === 'inside') {
  //     // Move to inside - set all participants in this group to be at this bar
  //     if (draggedFrom === 'waiting') {
  //       removeGroupFromWaitingList(currrentStop.id, draggedGroup)
  //     }
      
  //     // Set all participants in this group to have this bar as their current bar
  //     const { setAttendeeCurrentBar, getAttendee, updateAttendeeGroup } = await import('../services/barCrawlService')
  //     const attendees = getAllAttendeeLocations()
  //     let groupAttendees = attendees.filter(
  //       attendee => attendee.group === draggedGroup
  //     )
      
  //     // If no attendees found for this group, create a placeholder attendee
  //     // This allows the coordinator to manage groups even before participants log in
  //     if (groupAttendees.length === 0) {
  //       // Create a placeholder attendee for this group
  //       const placeholderUserId = `group_${draggedGroup}_placeholder`
  //       const placeholderAttendee = getAttendee(placeholderUserId)
  //       // Set the group for the placeholder
  //       updateAttendeeGroup(placeholderUserId, draggedGroup)
  //       // Set the placeholder to be at this bar
  //       setAttendeeCurrentBar(placeholderUserId, currrentStop.id)
  //       // Add to our list so it gets processed
  //       groupAttendees = [{
  //         userId: placeholderUserId,
  //         group: draggedGroup,
  //         currentBarId: currrentStop.id
  //       }]
  //     }
      
  //     // Set each attendee in the group to be at this bar
  //     groupAttendees.forEach(attendee => {
  //       // Always set to ensure they're at this bar (even if already there, this ensures consistency)
  //       setAttendeeCurrentBar(attendee.userId, currrentStop.id)
  //     })
  //   } else if (target === 'notInside') {
  //     // Move to not inside
  //     if (draggedFrom === 'waiting') {
  //       removeGroupFromWaitingList(currrentStop.id, draggedGroup)
  //     } else if (draggedFrom === 'inside') {
  //       // Remove all attendees in this group from the bar and find next bar
  //       const { findNextBarForGroup, setAttendeeCurrentBar, leaveBarWithoutProcessing } = await import('../services/barCrawlService')
  //       const attendees = getAllAttendeeLocations()
  //       const groupAttendees = attendees.filter(
  //         attendee => attendee.currentBarId === currrentStop.id && attendee.group === draggedGroup
  //       )
        
  //       // Remove attendees from current bar first (without triggering processNextWaitingGroup)
  //       // This ensures accurate capacity counts when finding next bar
  //       groupAttendees.forEach(attendee => {
  //         leaveBarWithoutProcessing(attendee.userId)
  //       })
        
  //       // Now find next bar for the group (with updated capacity counts)
  //       // Use a version that doesn't automatically add to waiting list
  //       const { findNextBarForGroupWithoutAdding } = await import('../services/barCrawlService')
  //       let nextBar = findNextBarForGroupWithoutAdding(draggedGroup, currrentStop.id)
        
  //       // If no available bar found, find next unvisited bar in route
  //       if (!nextBar) {
  //         const { getBars, getGroupVisitedBars, getNextBarInRoute } = await import('../services/barCrawlService')
  //         const allBars = getBars()
  //         const visitedBars = getGroupVisitedBars(draggedGroup)
          
  //         if (currrentStop) {
  //           const currentIndex = allBars.findIndex(b => b.id === currrentStop.id)
  //           if (currentIndex !== -1) {
  //             // Find next unvisited bar in route
  //             for (let i = 0; i < allBars.length; i++) {
  //               const checkIndex = (currentIndex + 1 + i) % allBars.length
  //               const candidateBar = allBars[checkIndex]
  //               if (!visitedBars.includes(candidateBar.id)) {
  //                 nextBar = candidateBar
  //                 break
  //               }
  //             }
  //           }
  //         }
  //       }
        
  //       // If a next bar was found, add the group to its waiting list only if needed
  //       // IMPORTANT: Only add the dragged group (the one being removed), never other groups
  //       if (nextBar && nextBar.id && draggedGroup) {
  //         // Get fresh data to ensure accurate capacity and waiting list checks
  //         const { getBars: getFreshBars } = await import('../services/barCrawlService')
  //         const freshBars = getFreshBars()
  //         const freshNextBar = freshBars.find(b => b.id === nextBar.id)
          
  //         if (freshNextBar) {
  //           // Check if bar has capacity and no waiting groups (using fresh data)
  //           const barHasCapacity = (freshNextBar.currentAttendees || 0) < (freshNextBar.capacity || 50)
  //           const barHasWaitingGroups = hasWaitingGroups(freshNextBar.id)
            
  //           // Only add the dragged group to waiting list - never add other groups
  //           // Explicitly use draggedGroup to ensure we never accidentally add a different group
  //           if (!barHasCapacity || barHasWaitingGroups) {
  //             // Bar is full or has waiting groups, add ONLY the dragged group to waiting list
  //             // Use explicit group number to prevent any confusion
  //             const groupToAdd = draggedGroup
  //             addGroupToWaitingList(freshNextBar.id, groupToAdd)
  //           }
  //           // If bar has capacity and no waiting groups, participants will see it as available
  //           // and can check in directly when they refresh their view
  //         }
  //       }
        
  //       // Process the next waiting group at the current bar (now that group has left)
  //       // This should only process groups that were already waiting, not add new ones
  //       // Do this AFTER we've handled the removed group to avoid interfering
  //       // NOTE: processNextWaitingGroup does NOT add groups - it only checks existing waiting groups
  //       const { processNextWaitingGroup } = await import('../services/barCrawlService')
  //       processNextWaitingGroup(currrentStop.id)
  //     }
  //   }

  //   setDraggedGroup(null)
  //   setDraggedFrom(null)
  //   // Small delay to ensure state updates
  //   setTimeout(() => {
  //     loadGroupData()
  //   }, 100)
  // }

  // const renderGroupBox = (groups, title, dropTarget) => {
  //   const isDraggingOver = draggedGroup && draggedFrom !== dropTarget
    
  //   return (
  //     <div
  //       className={`group-box ${dropTarget} ${isDraggingOver ? 'drag-over' : ''}`}
  //       onDragOver={handleDragOver}
  //       onDrop={(e) => handleDrop(e, dropTarget)}
  //     >
  //       <h3>{title} ({groups.length})</h3>
  //       <div className="groups-container">
  //         {groups.length === 0 ? (
  //           <div className="empty-groups">No groups</div>
  //         ) : (
  //           groups.map(group => (
  //             <div
  //               key={group}
  //               className="group-item"
  //               draggable
  //               onDragStart={(e) => handleDragStart(e, group, dropTarget)}
  //               onDragEnd={() => {
  //                 setDraggedGroup(null)
  //                 setDraggedFrom(null)
  //               }}
  //             >
  //               Group {group}
  //             </div>
  //           ))
  //         )}
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="coordinator-view">
      <div className="coordinator-header">
        <div>
          <h1>Coordinator</h1>
          <p>Bar: {currrentStop.bar.name}</p>
        </div>
        <div className="header-actions">
          <button className="change-bar-btn" onClick={() => {
            setCurrentBar(null)
            // Clear user's current bar in localStorage
            const updatedUser = { ...user, currentBarId: null }
          }}>
            Change Bar
          </button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>

    <div className="group-box">
         <h3>In Transit</h3>
         <p>These participants are currently in transit to the bar.</p>
         <div className="groups-container">
           {groups.length === 0 ? (
             <div className="empty-groups">No groups</div>
           ) : (
             transitGroups.map(group => (
               <div key={group} className="group-item">
                 Group {group}
               </div>
             ))
           )}
         </div>
       </div>

      <div className="coordinator-content">
        <div className="groups-layout">
          <div className="columns-container">
            {renderGroupBox(groupsWaiting, 'Groups Waiting to Enter', 'waiting')}
            {renderGroupBox(groupsInside, 'Groups Currently Inside', 'inside')}
          </div>
          {renderGroupBox(groupsNotInside, 'Groups Not Inside the Bar', 'notInside')}
        </div>
      </div>
    </div>
     )
}
}
export default CoordinatorView

