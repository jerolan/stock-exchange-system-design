/**
 * Node in a doubly linked list.
 * @template T Type of value stored in the node.
 */
export class ListNode<T> {
  /** Value stored in the node. */
  value: T;
  /** Previous node in the list. */
  prev: ListNode<T> | null = null;
  /** Next node in the list. */
  next: ListNode<T> | null = null;

  /**
   * Creates a new list node.
   * @param value - Value to store in the node.
   */
  constructor(value: T) {
    this.value = value;
  }
}

/**
 * Doubly linked list with O(1) append and remove operations.
 * Used for FIFO queues in the order book.
 * @template T Type of value stored in the list.
 */
export class DoublyLinkedList<T> {
  /** First node in the list. */
  head: ListNode<T> | null = null;
  /** Last node in the list. */
  tail: ListNode<T> | null = null;
  private _size = 0;

  /**
   * Appends a value to the end of the list (FIFO).
   * O(1)
   * @param value - Value to append.
   * @returns The new node.
   */
  append(value: T): ListNode<T> {
    const node = new ListNode(value);
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this._size++;
    return node;
  }

  /**
   * Removes a known node from the list.
   * O(1)
   * @param node - Node to remove.
   */
  remove(node: ListNode<T>) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
    node.prev = null;
    node.next = null;
    this._size--;
  }

  /**
   * Returns the first value in the list without removing it.
   * O(1)
   * @returns The first value or null if empty.
   */
  peek(): T | null {
    return this.head ? this.head.value : null;
  }

  /**
   * Checks if the list is empty.
   * @returns True if empty, false otherwise.
   */
  isEmpty(): boolean {
    return this._size === 0;
  }

  /**
   * Returns the size of the list (for debug/demo).
   * @returns Number of nodes in the list.
   */
  size(): number {
    return this._size;
  }
}
